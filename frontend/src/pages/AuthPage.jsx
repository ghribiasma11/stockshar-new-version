import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth/AuthContext.jsx';

export default function AuthPage() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get('mode') === 'signup' ? 'signup' : 'signin');
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    organization: '',
    city: '',
    role: 'receiver',
    acceptedTerms: false
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (mode === 'signup' && !form.acceptedTerms) {
      setError('You must accept the Terms of Use and the Privacy Policy to create an account.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'signup') {
        const data = await api.post('/auth/register', {
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          organization: form.organization,
          city: form.city,
          role: form.role,
          acceptedTerms: form.acceptedTerms
        });
        login(data.token, data.user);
      } else {
        const data = await api.post('/auth/login', { email: form.email, password: form.password });
        login(data.token, data.user);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-split">
      <div className="auth-left">
        <span className="ring ring-a" />
        <span className="ring ring-b" />
        <Link to="/" className="brand">
          <span className="brand-mark" />
          <span className="brand-word">StockShare</span>
        </Link>
        <div className="auth-copy">
          <p className="eyebrow">Surplus, redirected</p>
          <h2>Good food. Next chapter.</h2>
          <p>Join the shared marketplace that keeps good ingredients in use instead of in the bin.</p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h1>{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h1>
          <div className="seg">
            <button type="button" className={mode === 'signin' ? 'active' : ''} onClick={() => { setMode('signin'); setError(''); }}>
              Sign in
            </button>
            <button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => { setMode('signup'); setError(''); }}>
              Create account
            </button>
          </div>

          <form onSubmit={submit}>
            {mode === 'signup' && (
              <>
                <label>Full name
                  <input required value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
                </label>
                <label>Organization
                  <input value={form.organization} onChange={(e) => update('organization', e.target.value)} />
                </label>
                <label>City
                  <input value={form.city} onChange={(e) => update('city', e.target.value)} />
                </label>
                <label>I am a
                  <select value={form.role} onChange={(e) => update('role', e.target.value)}>
                    <option value="receiver">Receiver (I look for surplus)</option>
                    <option value="emitter">Emitter (I have surplus)</option>
                  </select>
                </label>
              </>
            )}

            <label>Email
              <input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
            </label>
            <label>Password
              <input
                required
                type="password"
                minLength={mode === 'signup' ? 8 : undefined}
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
              />
            </label>

            {mode === 'signup' && (
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={form.acceptedTerms}
                  onChange={(e) => update('acceptedTerms', e.target.checked)}
                />
                <span>
                  I accept the <Link to="/terms">Terms of Use</Link> and the <Link to="/privacy">Privacy Policy</Link>.
                </span>
              </label>
            )}

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
              {busy ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
