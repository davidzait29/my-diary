import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../utils/supabase.js';
import { requireMaster } from '../middleware/auth.js';

export const entriesRouter = express.Router();

// Multer: memory storage, 5MB limit, txt only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/plain' || file.originalname.endsWith('.txt')) {
      cb(null, true);
    } else {
      cb(new Error('Only .txt files allowed'));
    }
  },
});

function parseDateFromFilename(filename) {
  const base = filename.replace(/\.txt$/i, '');
  const m = base.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  return null;
}

function parseTitleFromFilename(filename) {
  const base = filename.replace(/\.txt$/i, '');
  const noDate = base.replace(/\d{4}-\d{2}-\d{2}[-_]?/, '').replace(/[-_]/g, ' ').trim();
  return noDate || 'Untitled Entry';
}

// GET /api/entries — both master & visitor can list
entriesRouter.get('/', async (req, res) => {
  try {
    const { search, favorite, sort = 'entry_date', order = 'desc', limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('entries')
      .select('id, title, entry_date, word_count, char_count, is_favorite, created_at, updated_at, content_preview')
      .order(sort, { ascending: order === 'asc' })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (favorite === 'true') query = query.eq('is_favorite', true);
    if (search) query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: 'Failed to load entries' });

    res.json({ entries: data });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/entries/calendar — both roles
entriesRouter.get('/calendar', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('entries')
      .select('entry_date, id, title');

    if (error) return res.status(500).json({ error: 'Failed to load calendar' });
    res.json({ dates: data });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/entries/export/all — master only
entriesRouter.get('/export/all', requireMaster, async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .order('entry_date', { ascending: false });

    if (error) return res.status(500).json({ error: 'Failed to export' });
    res.json({ entries: data, exportedAt: new Date().toISOString() });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/entries/:id — both roles can read
entriesRouter.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Entry not found' });
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/entries/upload — master only
entriesRouter.post('/upload', requireMaster, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const content = req.file.buffer.toString('utf-8').trim();
    if (!content) return res.status(400).json({ error: 'File is empty' });

    const filename = req.file.originalname;
    const entryDate = parseDateFromFilename(filename) || new Date().toISOString().slice(0, 10);
    const rawTitle = parseTitleFromFilename(filename);
    const title = req.body.title || rawTitle || 'Untitled';

    const { data: existing } = await supabase
      .from('entries')
      .select('id')
      .eq('entry_date', entryDate)
      .eq('title', title)
      .limit(1);

    if (existing && existing.length > 0) {
      return res.status(409).json({
        error: 'An entry with this date and title already exists.',
        existingId: existing[0].id,
      });
    }

    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const charCount = content.length;

    const { data, error } = await supabase
      .from('entries')
      .insert({
        id: uuidv4(),
        title,
        entry_date: entryDate,
        content,
        content_preview: content.slice(0, 200),
        word_count: wordCount,
        char_count: charCount,
        is_favorite: false,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: 'Failed to save entry' });
    res.status(201).json(data);
  } catch (err) {
    if (err.message === 'Only .txt files allowed') {
      return res.status(400).json({ error: 'Only .txt files are accepted' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/entries — master only
entriesRouter.post('/', requireMaster, async (req, res) => {
  try {
    const { title, entry_date, content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required' });

    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const charCount = content.length;

    const { data, error } = await supabase
      .from('entries')
      .insert({
        id: uuidv4(),
        title: title || 'Untitled',
        entry_date: entry_date || new Date().toISOString().slice(0, 10),
        content,
        content_preview: content.slice(0, 200),
        word_count: wordCount,
        char_count: charCount,
        is_favorite: false,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: 'Failed to create entry' });
    res.status(201).json(data);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/entries/:id — master only
entriesRouter.patch('/:id', requireMaster, async (req, res) => {
  try {
    const { title, entry_date, content, is_favorite } = req.body;
    const updates = { updated_at: new Date().toISOString() };

    if (title !== undefined) updates.title = title;
    if (entry_date !== undefined) updates.entry_date = entry_date;
    if (is_favorite !== undefined) updates.is_favorite = is_favorite;
    if (content !== undefined) {
      updates.content = content;
      updates.content_preview = content.slice(0, 200);
      updates.word_count = content.split(/\s+/).filter(Boolean).length;
      updates.char_count = content.length;
    }

    const { data, error } = await supabase
      .from('entries')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: 'Failed to update entry' });
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/entries/:id — master only
entriesRouter.delete('/:id', requireMaster, async (req, res) => {
  try {
    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', req.params.id);

    if (error) return res.status(500).json({ error: 'Failed to delete entry' });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});
