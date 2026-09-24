const BASE = import.meta.env.VITE_API_BASE || '/api';

function authHeaders() {
  const token = localStorage.getItem('stockshare_token');
  return token ? { Authorization: 'Bearer ' + token } : {};
}

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Request failed.');
  }
  return data;
}

export const api = {
  get: (path) => fetch(BASE + path, { headers: authHeaders() }).then(handle),
  post: (path, body) =>
    fetch(BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(body || {})
    }).then(handle),
  put: (path, body) =>
    fetch(BASE + path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(body || {})
    }).then(handle),
  del: (path) => fetch(BASE + path, { method: 'DELETE', headers: authHeaders() }).then(handle),
  upload: (path, formData) => fetch(BASE + path, { method: 'POST', headers: authHeaders(), body: formData }).then(handle)
};
