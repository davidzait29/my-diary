import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import './LockScreen.css';

export default function LockScreen() {
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const formRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!password || loading) return;
    setLoading(true);
    setError('');
    try {
      await login(password);
    } catch (err) {
      setError(err.message || 'Incorrect PIN');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPassword('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="lock-screen">
      <div className="lock-bg" aria-hidden="true" />

      <main className="lock-card fade-in" role="main">
        <div className="lock-icon" aria-hidden="true">
          <LockIcon />
        </div>

        <h1 className="lock-title">My Diary</h1>
        <p className="lock-subtitle">Your private space</p>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className={shake ? 'shake' : ''}
          noValidate
          aria-label="Unlock your diary"
        >
          <div className="lock-input-wrap">
            <input
              className="lock-input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your PIN"
              autoComplete="current-password"
              aria-label="PIN or password"
              disabled={loading}
              autoFocus
            />
            <button
              type="button"
              className="lock-eye-btn"
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={0}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          {error && (
            <p className="lock-error" role="alert" aria-live="polite">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="lock-btn"
            disabled={!password || loading}
            aria-busy={loading}
          >
            {loading ? <span className="spinner" /> : 'Unlock'}
          </button>
        </form>

        <p className="lock-footer">Private &amp; Secure</p>
      </main>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
