import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth/AuthContext.jsx';

export default function MyLots() {
  const { user, loading: authLoading } = useAuth();
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!user || user.role !== 'emitter') return;
    api.get('/lots/mine').then((data) => setLots(data.lots || [])).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [user]);
  if (authLoading) return <p>Loading your workspace...</p>;
  if (!user) return <Navigate to="/auth" replace />;
  if (user.role !== 'emitter') return <Navigate to="/transfers" replace />;
  return <div>
    <div className="util-row"><span>Emitter workspace</span></div>
    <div className="page-head"><div><p className="eyebrow">Emitter workspace</p><h1>Your lots.</h1><p>Keep an eye on what is moving, what is reserved, and what has reached its next chapter.</p></div><Link className="btn btn-primary" to="/declare">+ Declare another lot</Link></div>
    {error && <p className="form-error">{error}</p>}
    <div className="table-wrap"><table className="lots-table"><thead><tr><th>Lot</th><th>Pathway</th><th>Status</th><th>Pickup by</th><th></th></tr></thead><tbody>
      {!loading && lots.map((lot) => <tr key={lot.id}><td><Link to={`/lots/${lot.id}`}><strong>{lot.title}</strong><small>{lot.quantity_value ?? lot.quantity_kg} {lot.quantity_unit || 'kg'} · {lot.location_city}</small></Link></td><td>{(lot.category || '').replaceAll('_', ' ')}</td><td><span className={`status-tag ${lot.status}`}>{lot.status}</span></td><td>{lot.pickup_at ? new Date(lot.pickup_at).toLocaleString() : lot.expiry_status === 'near_expiry' ? 'Near expiry' : 'Available now'}</td><td><Link to={`/lots/${lot.id}`} aria-label={`Open ${lot.title}`}>↗</Link></td></tr>)}
      {!loading && lots.length === 0 && <tr><td colSpan="5">No lots published yet. <Link to="/declare">Declare your first lot.</Link></td></tr>}
      {loading && <tr><td colSpan="5">Loading your lots...</td></tr>}
    </tbody></table></div>
  </div>;
}
