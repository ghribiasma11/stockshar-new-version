import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth/AuthContext.jsx';

export default function LotDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [lot, setLot] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    api
      .get('/lots/' + id)
      .then((data) => setLot(data.lot))
      .catch((err) => setError(err.message));
  }, [id]);

  async function reserve() {
    setStatus('');
    try {
      await api.post('/lots/' + id + '/reserve', {});
      setStatus('Reservation confirmed. The publisher will contact you.');
      setLot((prev) => ({ ...prev, status: 'reserved' }));
    } catch (err) {
      setStatus(err.message);
    }
  }

  if (error) {
    return <p className="form-error">{error}</p>;
  }
  if (!lot) {
    return <p>Loading lot...</p>;
  }

  const isOwner = Boolean(user) && user.id === lot.owner_id;
  const canReserve = Boolean(user) && !isOwner && lot.status === 'available';

  return (
    <div>
      <Link to="/marketplace" className="back-link">← Back to marketplace</Link>
      <div className="panel">
        <h1>{lot.title}</h1>
        <p className="lot-meta">
          {lot.quantity_kg} kg · {lot.expiry_status === 'near_expiry' ? 'Near expiry' : 'Fresh'} · {lot.location_city}, {lot.location_country}
        </p>
        <p>{lot.description}</p>

        <dl className="lot-facts">
          <div><dt>Publisher</dt><dd>{lot.owner_organization || lot.owner_name}</dd></div>
          <div><dt>Category</dt><dd>{lot.category}</dd></div>
          <div><dt>Status</dt><dd>{lot.status}</dd></div>
        </dl>

        {isOwner && (
          <p className="owner-note">You published this lot. Emitters cannot reserve their own lots.</p>
        )}

        {canReserve && (
          <button type="button" className="btn btn-primary" onClick={reserve}>Reserve this lot</button>
        )}

        {!user && (
          <p className="owner-note"><Link to="/auth">Sign in</Link> as a receiver to reserve this lot.</p>
        )}

        {status && <p className="form-status">{status}</p>}
      </div>
    </div>
  );
}
