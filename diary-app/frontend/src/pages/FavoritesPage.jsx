import React, { useEffect, useState } from 'react';
import { api } from '../utils/api.js';
import EntryCard from '../components/EntryCard.jsx';
import './SearchPage.css';

export default function FavoritesPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.entries.list({ favorite: 'true', limit: 100 })
      .then(({ entries }) => setEntries(entries || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="search-page fade-in">
      <h1 className="page-title">Favorites</h1>
      {loading ? (
        <div className="search-status"><span className="spinner" /></div>
      ) : entries.length === 0 ? (
        <div className="search-hint">
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>★</div>
          <p>No favorites yet.</p>
          <p style={{ marginTop: '.5rem', fontSize: '.875rem' }}>Open any entry and tap the star to add it here.</p>
        </div>
      ) : (
        <>
          <p className="search-count">{entries.length} favorite{entries.length !== 1 ? 's' : ''}</p>
          <div className="search-results">
            {entries.map(e => <EntryCard key={e.id} entry={e} />)}
          </div>
        </>
      )}
    </div>
  );
}
