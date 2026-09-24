import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Account() {
  const { user, logout } = useAuth();
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  if (!user) {
    return <p>Please sign in to manage your account.</p>;
  }

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  async function deactivate() {
    if (!window.confirm('Deactivate your account? You will be signed out and can reactivate later by signing in again.')) {
      return;
    }
    setStatus('Deactivating...');
    try {
      await api.post('/users/me/deactivate', {});
      await logout();
      navigate('/');
    } catch (err) {
      setStatus(err.message);
    }
  }

  async function remove() {
    if (!window.confirm('Delete your account permanently? This cannot be undone.')) {
      return;
    }
    setStatus('Deleting...');
    try {
      await api.del('/users/me');
      await logout();
      navigate('/');
    } catch (err) {
      setStatus(err.message);
    }
  }

  return (
    <div>
      <div className="util-row"><span>Account settings</span></div>
      <div className="page-head">
        <div>
          <h1>Account settings</h1>
          <p>Signed in as {user.email}.</p>
        </div>
      </div>

      <div className="panel">
        <section className="account-section" style={{ borderTop: 0, marginTop: 0, paddingTop: 0 }}>
          <h2>Session</h2>
          <button type="button" className="btn btn-secondary" onClick={handleLogout}>Log out</button>
        </section>

        <section className="account-section">
          <h2>Account status</h2>
          <p>Current status: {user.account_status}</p>
          <button type="button" className="btn btn-secondary" onClick={deactivate}>Deactivate account</button>
        </section>

        <section className="account-section danger">
          <h2>Delete account</h2>
          <p>This permanently removes your profile and the lots you published.</p>
          <button type="button" className="btn btn-danger" onClick={remove}>Delete account</button>
        </section>

        {status && <p className="form-status">{status}</p>}
      </div>

      <p style={{ marginTop: 20 }}><Link to="/profile">← Back to profile</Link></p>
    </div>
  );
}
