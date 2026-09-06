import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/dateHelpers.js';
import './EntryCard.css';

export default function EntryCard({ entry }) {
  return (
    <Link to={`/entry/${entry.id}`} className="entry-card" aria-label={`Read entry: ${entry.title}`}>
      <div className="ec-header">
        <time className="ec-date" dateTime={entry.entry_date}>
          {formatDate(entry.entry_date, 'short')}
        </time>
        {entry.is_favorite && <span className="ec-star" aria-label="Favorite">★</span>}
      </div>
      <h3 className="ec-title">{entry.title || 'Untitled'}</h3>
      {entry.content_preview && (
        <p className="ec-preview">{entry.content_preview}</p>
      )}
      <div className="ec-meta">
        <span>{entry.word_count?.toLocaleString() ?? 0} words</span>
      </div>
    </Link>
  );
}
