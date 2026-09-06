import React, { useState, useRef, useCallback } from 'react';
import { api } from '../utils/api.js';
import { useToast } from '../context/ToastContext.jsx';
import './UploadModal.css';

export default function UploadModal({ onClose, onSuccess }) {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  function parseTitleFromFile(f) {
    const base = f.name.replace(/\.txt$/i, '');
    return base.replace(/\d{4}-\d{2}-\d{2}[-_]?/, '').replace(/[-_]/g, ' ').trim() || 'Untitled';
  }

  function selectFile(f) {
    if (!f) return;
    if (!f.name.endsWith('.txt')) { setError('Only .txt files are accepted'); return; }
    if (f.size > 5 * 1024 * 1024) { setError('File must be under 5 MB'); return; }
    if (f.size === 0) { setError('File is empty'); return; }
    setFile(f);
    setTitle(parseTitleFromFile(f));
    setError('');
  }

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    selectFile(f);
  }, []);

  async function handleUpload() {
    if (!file) return;
    setUploading(true); setProgress(0); setError('');
    // Simulate progress
    const timer = setInterval(() => setProgress(p => Math.min(p + 15, 85)), 120);
    try {
      const entry = await api.entries.upload(file, title);
      clearInterval(timer); setProgress(100);
      toast.success('Entry added!');
      setTimeout(() => onSuccess(entry), 300);
    } catch (err) {
      clearInterval(timer); setProgress(0);
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal upload-modal" role="dialog" aria-modal="true" aria-labelledby="upload-title">
        <div className="modal-header">
          <h2 id="upload-title">New Diary Entry</h2>
          <button className="btn btn-icon" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        {!file ? (
          <div
            className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
            aria-label="Drop a .txt file here or click to choose"
          >
            <input
              ref={inputRef}
              type="file"
              accept=".txt,text/plain"
              style={{ display: 'none' }}
              onChange={e => selectFile(e.target.files[0])}
            />
            <div className="drop-icon"><UploadIcon /></div>
            <p className="drop-text">Drop your .txt file here</p>
            <p className="drop-sub">or click to choose</p>
            <span className="drop-hint">Max 5 MB · UTF-8 · .txt only</span>
          </div>
        ) : (
          <div className="file-preview">
            <div className="file-info">
              <span className="file-icon"><TxtIcon /></span>
              <div>
                <p className="file-name">{file.name}</p>
                <p className="file-size">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button className="btn btn-icon" onClick={() => setFile(null)} aria-label="Remove file">
                <CloseIcon />
              </button>
            </div>

            <label className="upload-label" htmlFor="entry-title">Title</label>
            <input
              id="entry-title"
              className="input"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Entry title"
              aria-label="Entry title"
            />

            {uploading && (
              <div className="progress-bar-wrap" aria-label={`Uploading ${progress}%`}>
                <div className="progress-bar" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        )}

        {error && <p className="upload-error" role="alert">{error}</p>}

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={uploading}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={!file || uploading}
            aria-busy={uploading}
          >
            {uploading ? <><span className="spinner" /> Uploading…</> : 'Save Entry'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CloseIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function UploadIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;
}
function TxtIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
}
