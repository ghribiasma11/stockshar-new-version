import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Transfers() {
  const { user, loading: authLoading } = useAuth();
  const [transfers, setTransfers] = useState([]);
  const [pins, setPins] = useState({});
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const reload = useCallback(() => api.get('/lots/transfers/mine').then((data) => setTransfers(data.transfers || [])).catch((err) => setError(err.message)).finally(() => setLoading(false)), []);
  useEffect(() => { if (user) reload(); }, [user, reload]);
  if (authLoading) return <p>Loading your workspace...</p>;
  if (!user) return <Navigate to="/auth" replace />;

  async function complete(transfer) {
    setError(''); setNotice('');
    try {
      await api.post(`/lots/transfers/${transfer.reservation_id}/complete`, { pin: pins[transfer.reservation_id] || '' });
      setNotice('Hand-off confirmed. This transfer is complete.');
      await reload();
    } catch (err) { setError(err.message); }
  }

  const emitter = user.role === 'emitter';
  return <div>
    <div className="util-row"><span>{user.organization || user.full_name} · {emitter ? 'Emitter' : 'Human receiver'}</span><Link to="/marketplace">⌕ &nbsp; Browse available lots</Link></div>
    <div className="page-head transfer-heading"><div><p className="eyebrow">Your movement</p><h1>Transfers.</h1><p>Reservations, pickup details, and a record of what made it through.</p></div></div>
    <div className="seg transfer-tabs"><Link className="active" to="/transfers">All transfers</Link><Link to="/marketplace">Find another lot</Link></div>
    {error && <p className="form-error">{error}</p>}{notice && <p className="form-status">{notice}</p>}
    {loading && <p>Loading transfers...</p>}
    {!loading && !transfers.length && <div className="panel transfer-empty"><h2>No transfers yet.</h2><p>Your reservations and hand-offs will appear here.</p><Link to="/marketplace" className="btn btn-primary">Browse marketplace</Link></div>}
    <div className="transfer-list">{transfers.map((transfer) => <article className="transfer-card" key={transfer.reservation_id}>
      <div className="transfer-card-head"><div><span className={`transfer-status ${transfer.transfer_status}`}>{transfer.transfer_status === 'completed' ? 'Completed' : 'Pending'}</span><h2>{transfer.title}</h2><p>{emitter ? `Reserved by ${transfer.receiver_organization || transfer.receiver_name}` : `From ${transfer.owner_organization || transfer.owner_name}`} · {new Date(transfer.reserved_at).toLocaleDateString()}</p></div>{!emitter && <div className="pickup-pin"><small>Pickup PIN</small><strong>{transfer.pickup_pin}</strong></div>}</div>
      <div className="transfer-action">{transfer.transfer_status === 'completed' ? <p>Completed {transfer.completed_at ? new Date(transfer.completed_at).toLocaleDateString() : ''}</p> : emitter ? <><div className="receiver-contact"><strong>Contact the receiver</strong><span>{transfer.receiver_email && <a href={`mailto:${transfer.receiver_email}`}>{transfer.receiver_email}</a>}{transfer.receiver_phone && <a href={`tel:${transfer.receiver_phone}`}>{transfer.receiver_phone}</a>}{!transfer.receiver_email && !transfer.receiver_phone && <span>No contact details provided.</span>}</span></div><form onSubmit={(event) => { event.preventDefault(); complete(transfer); }}><input inputMode="numeric" pattern="[0-9]{4}" maxLength="4" placeholder="Enter 4-digit PIN" value={pins[transfer.reservation_id] || ''} onChange={(event) => setPins({ ...pins, [transfer.reservation_id]: event.target.value.replace(/\D/g, '').slice(0, 4) })} required /><button className="btn btn-primary" type="submit">Confirm hand-off</button></form></> : <p>Show this PIN to the emitter when you collect your lot.</p>}</div>
    </article>)}</div>
  </div>;
}
