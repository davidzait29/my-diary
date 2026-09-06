import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api.js';
import { toInputDate } from '../utils/dateHelpers.js';
import { useToast } from '../context/ToastContext.jsx';
import './EntryEditor.css';

export default function EntryEditor({ isNew }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    api.entries.get(id)
      .then(e => {
        setTitle(e.title || '');
        setDate(toInputDate(e.entry_date));
        setContent(e.content || '');
      })
      .catch(() => toast.error('Entry not found'))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  async function handleSave() {
    if (!content.trim()) { toast.error('Content cannot be empty'); return; }
    setSaving(true);
    try {
      let entry;
      if (isNew) {
        entry = await api.entries.create({ title: title || 'Untitled', entry_date: date, content });
      } else {
        entry = await api.entries.update(id, { title, entry_date: date, content });
      }
      toast.success('Saved');
      navigate(`/entry/${entry.id}`);
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally { setSaving(false); }
  }

  if (loading) return <div style={{ padding: '3rem', color: 'var(--text-secondary)' }}><span className="spinner" /></div>;

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="editor-page fade-in">
      <div className="editor-topbar">
        <Link
          to={isNew ? '/' : `/entry/${id}`}
          className="btn btn-ghost"
          style={{ gap: '.35rem' }}
        >
          <BackIcon /> {isNew ? 'Cancel' : 'Discard'}
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <span className="editor-wordcount">{wordCount.toLocaleString()} words</span>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} aria-busy={saving}>
            {saving ? <><span className="spinner" /> Saving…</> : 'Save Entry'}
          </button>
        </div>
      </div>

      <div className="editor-fields">
        <input
          className="editor-title-input"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Entry title…"
          aria-label="Entry title"
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label htmlFor="entry-date" style={{ fontSize: '.8125rem', color: 'var(--text-muted)', flexShrink: 0 }}>Date</label>
          <input
            id="entry-date"
            className="input"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            aria-label="Entry date"
            style={{ maxWidth: 180 }}
          />
        </div>
        <textarea
          className="editor-textarea"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Write your thoughts…"
          aria-label="Entry content"
          spellCheck
        />
      </div>
    </div>
  );
}

function BackIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
}
