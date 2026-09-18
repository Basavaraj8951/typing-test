// api.js
// Thin wrapper around the TypingPro backend. If the server is not running,
// callers fall back to local data so the app keeps working offline.

const BASE_URL = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API request failed: ${res.status}`);
  }
  return res.json();
}

export async function fetchRandomPassage(category) {
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  return request(`/passages/random${query}`);
}

export async function fetchStats() {
  return request('/stats');
}

export async function submitResult(result) {
  return request('/stats', {
    method: 'POST',
    body: JSON.stringify(result),
  });
}

export async function resetStats() {
  return request('/stats', { method: 'DELETE' });
}
