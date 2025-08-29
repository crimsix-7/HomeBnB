
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function getToken() {
  return localStorage.getItem('token') || '';
}
export function setToken(t) {
  if (t) localStorage.setItem('token', t);
  else localStorage.removeItem('token');
}

async function req(path, options = {}) {
  const headers = options.headers || {};
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: options.body instanceof FormData ? options.body : JSON.stringify(options.body)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  signup: (data) => req('/api/auth/signup', { method: 'POST', body: data }),
  login: (data) => req('/api/auth/login', { method: 'POST', body: data }),
  me: () => req('/api/me'),
  listListings: (params={}) => {
    const qs = new URLSearchParams(params);
    return fetch(`${API_BASE}/api/listings?` + qs.toString()).then(r => r.json());
  },
  getListing: (id) => fetch(`${API_BASE}/api/listings/${id}`).then(r => r.json()),
  createListing: (data) => req('/api/listings', { method: 'POST', body: data }),
  myHostListings: () => req('/api/host/listings', { method: 'GET' }),
  myTrips: () => req('/api/trips', { method: 'GET' }),
  book: (data) => req('/api/bookings', { method: 'POST', body: data }),
};
