import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api.js';
import { formatDate } from '../utils/dateHelpers.js';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import DeleteConfirmModal from '../components/DeleteConfirmModal.jsx';
import './EntryView.css';

export default function EntryView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isMaster } = useAuth();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    api.entries.get(id)
      .then(setEntry)
      .catch(() => toast.error('Entry not found'))
      .finally(() => setLoading(false));
  }, [id]);

  async function toggleFavorite() {
    if (!entry || toggling || !isMaster) return;
    setToggling(true);
    try {
      const updated = await api.entries.update(id, { is_favorite: !entry.is_favorite });
      setEntry(updated);
      toast.success(updated.is_favorite ? 'Added to favorites' : 'Removed from favorites');
    } catch { toast.error('Failed to update'); }
    finally { setToggling(false); }
  }

  async function handleDelete() {
    try {
      await api.entries.delete(id);
      toast.success('Entry deleted');
      navigate('/');
    } catch { toast.error('Delete failed'); }
  }

  function downloadTxt() {
    const text = `${entry.title}\n${formatDate(entry.entry_date)}\n\n${entry.content}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${entry.entry_date}-${entry.title}.txt`;
    a.click(); URL.revokeObjectURL(url);
  }

  if (loading) return <div className="entry-loading"><span className="spinner" style={{ width: 24, height: 24 }} /></div>;
  if (!entry)  return <div className="entry-loading"><p>Entry not found.</p><Link to="/" className="btn btn-ghost" style={{ marginTop: '1rem' }}>Go back</Link></div>;

  return (
    <div className="entry-view fade-in">
      <nav className="entry-topbar" aria-label="Entry navigation">
        <Link to="/" className="btn btn-ghost back-btn"><BackIcon /> Back</Link>
        <div className="entry-actions">
          {/* Favorite — master only */}
          {isMaster && (
            <button className={`btn btn-icon fav-btn ${entry.is_favorite ? 'favorited' : ''}`}
              onClick={toggleFavorite} disabled={toggling}
              aria-label={entry.is_favorite ? 'Remove from favorites' : 'Add to favorites'}>
              <StarIcon filled={entry.is_favorite} />
            </button>
          )}
          {/* Visitor can see favorite status but not toggle it */}
          {!isMaster && entry.is_favorite && (
            <span className="fav-readonly" aria-label="Favorited" title="Favorited by owner">
              <StarIcon filled={true} />
            </span>
          )}

          {/* Edit — master only */}
          {isMaster && (
            <Link to={`/entry/${id}/edit`} className="btn btn-ghost" aria-label="Edit entry">
              <EditIcon /> Edit
            </Link>
          )}

          {/* Download — both can download */}
          <button className="btn btn-ghost" onClick={downloadTxt} aria-label="Download as TXT">
            <DownloadIcon /> Export
          </button>

          {/* Delete — master only */}
          {isMaster && (
            <button className="btn btn-danger" onClick={() => setShowDelete(true)} aria-label="Delete entry">
              <TrashIcon />
            </button>
          )}
        </div>
      </nav>

      <article className="entry-article">
        <header className="entry-article-header">
          <time className="entry-article-date" dateTime={entry.entry_date}>
            {formatDate(entry.entry_date, 'long')}
          </time>
          <h1 className="entry-article-title">{entry.title}</h1>
          <div className="entry-meta">
            <span>{entry.word_count?.toLocaleString()} words</span>
            <span>·</span>
            <span>{entry.char_count?.toLocaleString()} characters</span>
          </div>
        </header>

        <div className="entry-body">
          {entry.content.split('\n').map((line, i) =>
            line.trim() ? <p key={i}>{line}</p> : <br key={i} />
          )}
        </div>

        <footer className="entry-article-footer">
          <span>Saved {formatDate(entry.created_at || entry.entry_date, 'short')}</span>
          {entry.updated_at && entry.updated_at !== entry.created_at && (
            <span>· Edited {formatDate(entry.updated_at, 'short')}</span>
          )}
        </footer>
      </article>

      {showDelete && isMaster && (
        <DeleteConfirmModal title={entry.title} onConfirm={handleDelete} onCancel={() => setShowDelete(false)} />
      )}
    </div>
  );
}

function BackIcon()     { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>; }
function StarIcon({ filled }) { return <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>; }
function EditIcon()     { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }
function DownloadIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>; }
function TrashIcon()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>; }
