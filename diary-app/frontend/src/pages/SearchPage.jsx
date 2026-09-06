import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api.js';
import EntryCard from '../components/EntryCard.jsx';
import './SearchPage.css';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true); setSearched(true);
    try {
      const { entries } = await api.entries.list({ search: q, limit: 50 });
      setResults(entries || []);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 350);
    return () => clearTimeout(t);
  }, [query, search]);

  return (
    <div className="search-page fade-in">
      <h1 className="page-title">Search</h1>

      <div className="search-input-wrap">
        <SearchIcon />
        <input
          className="search-input"
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search your diary…"
          aria-label="Search entries"
          autoFocus
        />
        {query && (
          <button className="search-clear" onClick={() => setQuery('')} aria-label="Clear search">✕</button>
        )}
      </div>

      {loading && <div className="search-status"><span className="spinner" /></div>}

      {!loading && searched && results.length === 0 && (
        <div className="search-status">
          <p>No entries found for "{query}"</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <>
          <p className="search-count">{results.length} result{results.length !== 1 ? 's' : ''}</p>
          <div className="search-results">
            {results.map(e => <EntryCard key={e.id} entry={e} />)}
          </div>
        </>
      )}

      {!searched && (
        <div className="search-hint">
          <p>Search by title, date, or content</p>
        </div>
      )}
    </div>
  );
}

function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
