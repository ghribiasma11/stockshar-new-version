import { useEffect, useRef, useState } from 'react';
import { api, assetUrl } from '../api.js';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ fullName: '', organization: '', phone: '', city: '' });
  const [status, setStatus] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.full_name || '',
        organization: user.organization || '',
        phone: user.phone || '',
        city: user.city || ''
      });
    }
  }, [user]);

  if (!user) {
    return <p>Please sign in to view your profile.</p>;
  }

  async function save(event) {
    event.preventDefault();
    setStatus('Saving...');
    try {
      const data = await api.put('/users/me', form);
      updateUser(data.user);
      setStatus('Profile updated.');
    } catch (err) {
      setStatus(err.message);
    }
  }

  async function uploadPhoto(event) {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    const formData = new FormData();
    formData.append('photo', file);
    setStatus('Uploading photo...');
    try {
      const data = await api.upload('/users/me/photo', formData);
      updateUser({ avatar_url: data.avatar_url });
      setStatus('Profile photo updated.');
    } catch (err) {
      setStatus(err.message);
    }
  }

  return (
    <div>
      <div className="util-row"><span>Your profile</span></div>
      <div className="page-head">
        <div>
          <h1>Your profile</h1>
          <p className="muted">Update your details and profile photo.</p>
        </div>
      </div>

      <div className="panel profile-panel">
        <div className="avatar-block">
          <div className="avatar-meta">
            {user.avatar_url ? (
              <img className="avatar" src={assetUrl(user.avatar_url)} alt="Profile" />
            ) : (
              <div className="avatar avatar-placeholder">{(user.full_name || 'U').charAt(0)}</div>
            )}
            <div className="avatar-text">
              <div className="user-main">{user.full_name || user.email}</div>
              <div className="muted user-sub">{user.organization || user.city || ''}</div>
            </div>
          </div>
          <div className="avatar-actions">
            <input ref={fileRef} type="file" accept="image/*" className="hidden-input" onChange={uploadPhoto} />
            <button type="button" className="btn btn-secondary" onClick={() => fileRef.current.click()}>
              Change profile photo
            </button>
          </div>
        </div>

        <form className="profile-form" onSubmit={save}>
          <label>Full name
            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </label>
          <label>Organization
            <input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
          </label>
          <label>Phone
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
          <label>City
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </label>
          <button type="submit" className="btn btn-primary">Save changes</button>
        </form>

        {status && <p className="form-status">{status}</p>}
      </div>
    </div>
  );
}
