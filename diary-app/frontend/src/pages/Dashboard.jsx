import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api.js';
import { formatDate, getGreeting } from '../utils/dateHelpers.js';
import EntryCard from '../components/EntryCard.jsx';
import './Dashboard.css';

export default function Dashboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.entries.list({ limit: 12 })
      .then(({ entries }) => setEntries(entries || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date();
  const greeting = getGreeting();

  return (
    <div className="dashboard fade-in">
      <header className="dash-header">
        <div>
          <h1 className="dash-greeting">{greeting}</h1>
          <p className="dash-date">{formatDate(today, 'long')}</p>
        </div>
        {!loading && (
          <div className="dash-stats">
            <div className="stat">
              <span className="stat-num">{entries.length > 0 ? entries.length + '+' : '0'}</span>
              <span className="stat-label">Entries</span>
            </div>
          </div>
        )}
      </header>

      {loading ? (
        <div className="dash-loading">
          <span className="spinner" style={{ width: 24, height: 24 }} />
        </div>
      ) : error ? (
        <div className="dash-error">
          <p>{error}</p>
          <button className="btn btn-ghost" onClick={() => window.location.reload()}>Retry</button>
        </div>
      ) : entries.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <section>
            <div className="section-header">
              <h2>Recent Entries</h2>
              <Link to="/search" className="see-all">View all</Link>
            </div>
            <div className="entries-grid">
              {entries.map(entry => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-icon">📖</div>
      <h2>Your diary is empty</h2>
      <p>Your first entry is waiting to be written.</p>
      <p className="empty-hint">Click <strong>+ New Entry</strong> and upload a .txt file to begin.</p>
    </div>
  );
}
