import express from 'express';
import bcrypt from 'bcryptjs';
import { supabase } from '../utils/supabase.js';

export const setupRouter = express.Router();

// Check if setup is needed
setupRouter.get('/status', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('owner')
      .select('id')
      .limit(1);

    if (error) return res.status(500).json({ error: 'Database error' });
    res.json({ setupNeeded: data.length === 0 });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create owner account — master + visitor password
// Only allowed if no owner exists yet
setupRouter.post('/create', async (req, res) => {
  try {
    const { masterPassword, visitorPassword } = req.body;

    if (!masterPassword || masterPassword.length < 4) {
      return res.status(400).json({ error: 'Master password must be at least 4 characters' });
    }
    if (!visitorPassword || visitorPassword.length < 4) {
      return res.status(400).json({ error: 'Visitor password must be at least 4 characters' });
    }
    if (masterPassword === visitorPassword) {
      return res.status(400).json({ error: 'Master and visitor passwords must be different' });
    }

    // Check if already set up
    const { data: existing } = await supabase
      .from('owner')
      .select('id')
      .limit(1);

    if (existing && existing.length > 0) {
      return res.status(409).json({ error: 'Diary already set up. Use the login screen.' });
    }

    const [masterHash, visitorHash] = await Promise.all([
      bcrypt.hash(masterPassword, 12),
      bcrypt.hash(visitorPassword, 12),
    ]);

    const { error } = await supabase
      .from('owner')
      .insert({ password_hash: masterHash, visitor_password_hash: visitorHash });

    if (error) return res.status(500).json({ error: 'Failed to create account' });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});
