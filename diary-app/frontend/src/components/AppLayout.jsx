import React, { useState, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import UploadModal from './UploadModal.jsx';
import VisitorBadge from './VisitorBadge.jsx';
import './AppLayout.css';

export default function AppLayout({ children }) {
  const { logout, isMaster, isVisitor } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  const handleUploadSuccess = useCallback((entry) => {
    setUploadOpen(false);
    navigate(`/entry/${entry.id}`);
  }, [navigate]);

  // Nav items — settings only for master
  const NAV = [
    { to: '/', icon: <BookIcon />, label: 'All Entries', exact: true },
    { to: '/calendar', icon: <CalIcon />, label: 'Calendar' },
    { to: '/favorites', icon: <StarIcon />, label: 'Favorites' },
    { to: '/search', icon: <SearchIcon />, label: 'Search' },
    ...(isMaster ? [{ to: '/settings', icon: <GearIcon />, label: 'Settings' }] : []),
  ];

  return (
    <div className="app-layout">
      <div className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`} onClick={closeSidebar} aria-hidden="true" />

      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`} aria-label="Main navigation">
        <div className="sidebar-header">
          <span className="sidebar-brand"><BookIcon /> My Diary</span>
          {isVisitor && <span className="visitor-pill">Visitor</span>}
        </div>

        <div className="sidebar-nav">
          {NAV.map(({ to, icon, label, exact }) => (
            <NavLink key={to} to={to} end={exact}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={closeSidebar}>
              {icon} <span>{label}</span>
            </NavLink>
          ))}
        </div>

        <div className="sidebar-bottom">
          <button className="sidebar-link logout-btn" onClick={() => { closeSidebar(); logout(); }}
            aria-label="Lock diary">
            <LockIcon /> <span>Lock Diary</span>
          </button>
        </div>
      </nav>

      <div className="main-content">
        <header className="mobile-topbar">
          <button className="btn btn-icon" onClick={() => setSidebarOpen(v => !v)}
            aria-label="Open navigation" aria-expanded={sidebarOpen}>
            <MenuIcon />
          </button>
          <span className="mobile-title">My Diary</span>
          {isMaster && (
            <button className="btn btn-primary new-entry-btn-mobile"
              onClick={() => setUploadOpen(true)} aria-label="New entry">
              <PlusIcon />
            </button>
          )}
          {isVisitor && <span className="visitor-pill-mobile">Visitor</span>}
        </header>

        {isVisitor && <VisitorBadge />}

        <div className="page-content">{children}</div>
      </div>

      {/* FAB — master only */}
      {isMaster && (
        <button className="fab" onClick={() => setUploadOpen(true)}
          aria-label="Add new diary entry" title="New Entry">
          <PlusIcon />
        </button>
      )}

      {uploadOpen && (
        <UploadModal onClose={() => setUploadOpen(false)} onSuccess={handleUploadSuccess} />
      )}
    </div>
  );
}

function BookIcon()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>; }
function CalIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
function StarIcon()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>; }
function SearchIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function GearIcon()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>; }
function LockIcon()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>; }
function PlusIcon()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function MenuIcon()   { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>; }
