import React from 'react';

export default function DeleteConfirmModal({ title, onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="del-title">
      <div className="modal" style={{ maxWidth: 380, textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🗑️</div>
        <h2 id="del-title" style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '.5rem' }}>
          Delete this entry?
        </h2>
        <p style={{ fontSize: '.9rem', color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
          <strong style={{ color: 'var(--text-primary)' }}>{title}</strong> will be permanently deleted. This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center' }}>
          <button className="btn btn-ghost" onClick={onCancel} autoFocus>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}
