import React, { useState } from 'react';
import { api } from '../utils/api.js';
import './LockScreen.css';
import './SetupScreen.css';

export default function SetupScreen({ onComplete }) {
  const [masterPw, setMasterPw]       = useState('');
  const [masterConfirm, setMasterConfirm] = useState('');
  const [visitorPw, setVisitorPw]     = useState('');
  const [visitorConfirm, setVisitorConfirm] = useState('');
  const [showPw, setShowPw]           = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [step, setStep]               = useState(1); // 1 = master, 2 = visitor

  function goToStep2(e) {
    e.preventDefault();
    if (masterPw.length < 4)          { setError('Master password must be at least 4 characters'); return; }
    if (masterPw !== masterConfirm)   { setError('Master passwords do not match'); return; }
    setError('');
    setStep(2);
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (visitorPw.length < 4)         { setError('Visitor password must be at least 4 characters'); return; }
    if (visitorPw !== visitorConfirm) { setError('Visitor passwords do not match'); return; }
    if (visitorPw === masterPw)       { setError('Visitor password must be different from master password'); return; }

    setLoading(true); setError('');
    try {
      await api.setup.create(masterPw, visitorPw);
      onComplete();
    } catch (err) {
      setError(err.message || 'Setup failed');
    } finally { setLoading(false); }
  }

  const EyeToggle = () => (
    <button type="button" className="lock-eye-btn" onClick={() => setShowPw(v => !v)} aria-label="Toggle visibility">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {showPw
          ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
          : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
        }
      </svg>
    </button>
  );

  return (
    <div className="lock-screen">
      <div className="lock-bg" aria-hidden="true" />
      <main className="lock-card setup-card fade-in" role="main">

        {/* Step indicator */}
        <div className="setup-steps" aria-label="Setup progress">
          <div className={`setup-step ${step >= 1 ? 'done' : ''}`}>
            <span className="step-num">1</span>
            <span className="step-label">Master</span>
          </div>
          <div className="step-line" />
          <div className={`setup-step ${step >= 2 ? 'done' : ''}`}>
            <span className="step-num">2</span>
            <span className="step-label">Visitor</span>
          </div>
        </div>

        {step === 1 && (
          <>
            <div className="lock-icon" style={{ marginTop: '1rem' }} aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h1 className="lock-title" style={{ fontSize: '1.6rem' }}>Master Password</h1>
            <p className="setup-desc">Aapke liye — poora access (read, write, edit, delete, settings)</p>

            <form onSubmit={goToStep2} noValidate style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '.875rem' }}>
              <div className="lock-input-wrap">
                <input className="lock-input" type={showPw ? 'text' : 'password'}
                  value={masterPw} onChange={e => setMasterPw(e.target.value)}
                  placeholder="Master password" autoComplete="new-password" autoFocus disabled={loading} />
                <EyeToggle />
              </div>
              <input className="lock-input" type={showPw ? 'text' : 'password'}
                value={masterConfirm} onChange={e => setMasterConfirm(e.target.value)}
                placeholder="Confirm master password" autoComplete="new-password" disabled={loading}
                style={{ textAlign: 'center', letterSpacing: '.05em' }} />
              {error && <p className="lock-error" role="alert">{error}</p>}
              <button type="submit" className="lock-btn" disabled={!masterPw || !masterConfirm}>
                Next →
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <div className="lock-icon" style={{ marginTop: '1rem', background: 'rgba(74,222,128,.1)', borderColor: 'rgba(74,222,128,.3)', color: '#4ade80' }} aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <h1 className="lock-title" style={{ fontSize: '1.6rem' }}>Visitor Password</h1>
            <p className="setup-desc">Doosron ke liye — sirf padhna, koi changes nahi</p>

            <form onSubmit={handleCreate} noValidate style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '.875rem' }}>
              <div className="lock-input-wrap">
                <input className="lock-input" type={showPw ? 'text' : 'password'}
                  value={visitorPw} onChange={e => setVisitorPw(e.target.value)}
                  placeholder="Visitor password" autoComplete="new-password" autoFocus disabled={loading} />
                <EyeToggle />
              </div>
              <input className="lock-input" type={showPw ? 'text' : 'password'}
                value={visitorConfirm} onChange={e => setVisitorConfirm(e.target.value)}
                placeholder="Confirm visitor password" autoComplete="new-password" disabled={loading}
                style={{ textAlign: 'center', letterSpacing: '.05em' }} />
              {error && <p className="lock-error" role="alert">{error}</p>}
              <div style={{ display: 'flex', gap: '.75rem' }}>
                <button type="button" className="lock-btn" style={{ background: 'transparent', border: '1px solid var(--border-mid)', color: 'var(--text-secondary)', flex: '0 0 auto', padding: '.9rem 1.25rem' }}
                  onClick={() => { setStep(1); setError(''); }} disabled={loading}>
                  ← Back
                </button>
                <button type="submit" className="lock-btn" style={{ flex: 1 }}
                  disabled={!visitorPw || !visitorConfirm || loading}>
                  {loading ? <span className="spinner" /> : 'Create Diary'}
                </button>
              </div>
            </form>
          </>
        )}

        <p className="lock-footer">Passwords are hashed &amp; never stored in plain text</p>
      </main>
    </div>
  );
}
