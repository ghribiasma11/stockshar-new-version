const BASE = import.meta.env.VITE_API_BASE || '/api';

// Absolute origin of the API, used to resolve relative asset paths such as "/uploads/photo.jpg"
// when the web app and the API are deployed on different hosts.
const API_ORIGIN = BASE.indexOf('http') === 0 ? BASE.replace(/\/api\/?$/, '') : '';

export function assetUrl(path) {
  if (!path) return path;
  if (path.indexOf('http') === 0) return path;
  return API_ORIGIN + path;
}

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
