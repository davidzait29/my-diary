import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../utils/api.js';
import './SettingsPage.css';

export default function SettingsPage() {
  const { logout } = useAuth();
  const toast = useToast();

  // Change master password
  const [curPw, setCurPw]       = useState('');
  const [newPw, setNewPw]       = useState('');
  const [confPw, setConfPw]     = useState('');
  const [changingMaster, setChangingMaster] = useState(false);

  // Change visitor password
  const [masterForVis, setMasterForVis]   = useState('');
  const [newVisPw, setNewVisPw]           = useState('');
  const [confVisPw, setConfVisPw]         = useState('');
  const [changingVisitor, setChangingVisitor] = useState(false);

  const [exporting, setExporting] = useState(false);

  async function handleChangeMaster(e) {
    e.preventDefault();
    if (newPw !== confPw)   { toast.error('New passwords do not match'); return; }
    if (newPw.length < 4)   { toast.error('Password must be at least 4 characters'); return; }
    setChangingMaster(true);
    try {
      await api.auth.changePassword(curPw, newPw);
      toast.success('Master password changed. Please log in again.');
      setTimeout(logout, 1500);
    } catch (err) { toast.error(err.message || 'Failed'); }
    finally { setChangingMaster(false); setCurPw(''); setNewPw(''); setConfPw(''); }
  }

  async function handleChangeVisitor(e) {
    e.preventDefault();
    if (newVisPw !== confVisPw)  { toast.error('Visitor passwords do not match'); return; }
    if (newVisPw.length < 4)     { toast.error('Visitor password must be at least 4 characters'); return; }
    setChangingVisitor(true);
    try {
      await api.auth.changeVisitorPassword(masterForVis, newVisPw);
      toast.success('Visitor password updated');
    } catch (err) { toast.error(err.message || 'Failed'); }
    finally { setChangingVisitor(false); setMasterForVis(''); setNewVisPw(''); setConfVisPw(''); }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const data = await api.entries.exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `diary-backup-${new Date().toISOString().slice(0,10)}.json`;
      a.click(); URL.revokeObjectURL(url);
      toast.success('Export downloaded');
    } catch { toast.error('Export failed'); }
    finally { setExporting(false); }
  }

  return (
    <div className="settings-page fade-in">
      <h1 className="page-title">Settings</h1>

      {/* Master password */}
      <section className="settings-section">
        <h2 className="settings-heading">Master Password</h2>
        <form className="settings-card card" onSubmit={handleChangeMaster}>
          <p className="settings-hint">Changing this will log you out.</p>
          <div className="settings-field">
            <label htmlFor="cur-pw">Current master password</label>
            <input id="cur-pw" className="input" type="password" value={curPw}
              onChange={e => setCurPw(e.target.value)} placeholder="Current password" autoComplete="current-password" />
          </div>
          <div className="settings-field">
            <label htmlFor="new-pw">New master password</label>
            <input id="new-pw" className="input" type="password" value={newPw}
              onChange={e => setNewPw(e.target.value)} placeholder="New password" autoComplete="new-password" />
          </div>
          <div className="settings-field">
            <label htmlFor="conf-pw">Confirm new password</label>
            <input id="conf-pw" className="input" type="password" value={confPw}
              onChange={e => setConfPw(e.target.value)} placeholder="Confirm" autoComplete="new-password" />
          </div>
          <button type="submit" className="btn btn-primary"
            disabled={!curPw || !newPw || !confPw || changingMaster}>
            {changingMaster ? <><span className="spinner" /> Saving…</> : 'Change Master Password'}
          </button>
        </form>
      </section>

      {/* Visitor password */}
      <section className="settings-section">
        <h2 className="settings-heading">Visitor Password</h2>
        <div className="settings-card card" style={{ marginBottom: '.75rem' }}>
          <p className="settings-hint" style={{ marginBottom: 0 }}>
            Visitor password sirf padhne deta hai — koi bhi edit, delete, upload, ya settings nahi kar sakta. Ye password jo bhi use karega wo sirf diary padh sakta hai.
          </p>
        </div>
        <form className="settings-card card" onSubmit={handleChangeVisitor}>
          <div className="settings-field">
            <label htmlFor="master-for-vis">Your master password (to confirm)</label>
            <input id="master-for-vis" className="input" type="password" value={masterForVis}
              onChange={e => setMasterForVis(e.target.value)} placeholder="Master password" autoComplete="current-password" />
          </div>
          <div className="settings-field">
            <label htmlFor="new-vis-pw">New visitor password</label>
            <input id="new-vis-pw" className="input" type="password" value={newVisPw}
              onChange={e => setNewVisPw(e.target.value)} placeholder="New visitor password" autoComplete="new-password" />
          </div>
          <div className="settings-field">
            <label htmlFor="conf-vis-pw">Confirm visitor password</label>
            <input id="conf-vis-pw" className="input" type="password" value={confVisPw}
              onChange={e => setConfVisPw(e.target.value)} placeholder="Confirm" autoComplete="new-password" />
          </div>
          <button type="submit" className="btn btn-primary"
            disabled={!masterForVis || !newVisPw || !confVisPw || changingVisitor}>
            {changingVisitor ? <><span className="spinner" /> Saving…</> : 'Change Visitor Password'}
          </button>
        </form>
      </section>

      {/* Session */}
      <section className="settings-section">
        <h2 className="settings-heading">Session</h2>
        <div className="settings-card card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Lock Diary</p>
            <p style={{ fontSize: '.875rem', marginTop: '.25rem' }}>Sign out and return to lock screen</p>
          </div>
          <button className="btn btn-ghost" onClick={logout}>Lock Now</button>
        </div>
      </section>

      {/* Backup */}
      <section className="settings-section">
        <h2 className="settings-heading">Backup &amp; Export</h2>
        <div className="settings-card card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Export All Entries</p>
            <p style={{ fontSize: '.875rem', marginTop: '.25rem' }}>Download a JSON backup of all diary entries</p>
          </div>
          <button className="btn btn-ghost" onClick={handleExport} disabled={exporting}>
            {exporting ? <><span className="spinner" /> Exporting…</> : 'Export JSON'}
          </button>
        </div>
      </section>

      <section className="settings-section">
        <h2 className="settings-heading">About</h2>
        <div className="settings-card card">
          <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>My Private Diary · Version 1.0.0</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '.8125rem', marginTop: '.5rem' }}>
            Diary data is stored privately in Supabase. No data is in any public repository.
          </p>
        </div>
      </section>
    </div>
  );
}
