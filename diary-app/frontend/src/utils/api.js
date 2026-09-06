const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getToken() {
  return sessionStorage.getItem('diary_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  setup: {
    status: () => request('/api/setup/status'),
    // Now takes both masterPassword and visitorPassword
    create: (masterPassword, visitorPassword) => request('/api/setup/create', {
      method: 'POST',
      body: JSON.stringify({ masterPassword, visitorPassword }),
    }),
  },

  auth: {
    login: (password) => request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),
    verify: () => request('/api/auth/verify'),
    changePassword: (currentPassword, newPassword) => request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
    changeVisitorPassword: (currentPassword, newVisitorPassword) => request('/api/auth/change-visitor-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newVisitorPassword }),
    }),
  },

  entries: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/api/entries${qs ? '?' + qs : ''}`);
    },
    calendar: () => request('/api/entries/calendar'),
    get: (id) => request(`/api/entries/${id}`),
    upload: (file, title) => {
      const form = new FormData();
      form.append('file', file);
      if (title) form.append('title', title);
      const token = getToken();
      return fetch(`${BASE}/api/entries/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      }).then(async r => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`);
        return d;
      });
    },
    create: (data) => request('/api/entries', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/api/entries/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => request(`/api/entries/${id}`, { method: 'DELETE' }),
    exportAll: () => request('/api/entries/export/all'),
  },
};
