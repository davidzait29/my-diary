import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('diary_token'));
  const [role, setRole] = useState(() => sessionStorage.getItem('diary_role')); // 'master' | 'visitor'
  const [isVerified, setIsVerified] = useState(false);
  const [checking, setChecking] = useState(true);

  // On mount, verify existing token
  useEffect(() => {
    if (!token) { setChecking(false); return; }
    api.auth.verify()
      .then(({ role: r }) => {
        setIsVerified(true);
        setRole(r);
        sessionStorage.setItem('diary_role', r);
      })
      .catch(() => {
        sessionStorage.removeItem('diary_token');
        sessionStorage.removeItem('diary_role');
        setToken(null);
        setRole(null);
      })
      .finally(() => setChecking(false));
  }, []);

  const login = useCallback(async (password) => {
    const { token: t, role: r } = await api.auth.login(password);
    sessionStorage.setItem('diary_token', t);
    sessionStorage.setItem('diary_role', r);
    setToken(t);
    setRole(r);
    setIsVerified(true);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('diary_token');
    sessionStorage.removeItem('diary_role');
    setToken(null);
    setRole(null);
    setIsVerified(false);
  }, []);

  const isMaster = role === 'master';
  const isVisitor = role === 'visitor';
  const isAuthenticated = !!token && isVerified;

  return (
    <AuthContext.Provider value={{ isAuthenticated, checking, login, logout, token, role, isMaster, isVisitor }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
