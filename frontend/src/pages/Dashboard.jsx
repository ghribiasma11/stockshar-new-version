import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth/AuthContext.jsx';

const PATHWAYS = [
  { key: 'human_donation', label: 'Human donation' },
  { key: 'animal_feed', label: 'Animal feed' },
  { key: 'industrial_recycling', label: 'Industrial recycling' }
];

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [lots, setLots] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const emitter = user?.role === 'emitter';

  useEffect(() => {
    if (!user) return;
    Promise.all([
      emitter ? api.get('/lots/mine') : api.get('/lots'),
      api.get('/lots/transfers/mine')
    ])
      .then(([lotData, transferData]) => {
        setLots(lotData.lots || []);
        setTransfers(transferData.transfers || []);
        setReservations((transferData.transfers || []).filter((transfer) => transfer.transfer_status === 'pending'));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  const ownLots = useMemo(() => lots.filter((lot) => Number(lot.owner_id) === Number(user?.id)), [lots, user]);
  const availableLots = useMemo(() => lots.filter((lot) => lot.status === 'available'), [lots]);
  const relevantLots = emitter ? ownLots : availableLots;
  const pathwayCounts = PATHWAYS.map((pathway) => ({
    ...pathway,
    count: relevantLots.filter((lot) => lot.category === pathway.key).length
  }));
  const reservedCount = reservations.length;
  const receiverReservations = transfers.filter((transfer) => transfer.transfer_status === 'pending').length;
  const completedCount = transfers.filter((transfer) => transfer.transfer_status === 'completed').length;
  const savedKg = transfers.filter((transfer) => transfer.transfer_status === 'completed').reduce((sum, transfer) => sum + Number(transfer.quantity_kg || 0), 0);
  const totalPathways = Math.max(1, ...pathwayCounts.map((pathway) => pathway.count));

  if (authLoading) return <p className="dashboard-loading">Loading your workspace...</p>;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="dashboard-page">
      <div className="util-row dashboard-util">
        <span>{user.organization || user.full_name} · {emitter ? 'Emitter' : 'Human receiver'}</span>
        <Link to="/marketplace">⌕ &nbsp; Browse available lots</Link>
      </div>

      <section className="dashboard-heading">
        <div>
          <p className="eyebrow">Your overview</p>
          <h1>{emitter ? 'Good morning, ' : 'Good morning, '}{(user.full_name || 'there').split(' ')[0]}.</h1>
          <p>{emitter ? 'Keep good food in circulation.' : 'Make more meals possible, together.'}</p>
        </div>
        <div className="dashboard-actions">
          {emitter && <Link className="btn btn-primary" to="/declare">Declare a lot</Link>}
          <Link className="dashboard-impact-link" to="/impact">View impact certificate ↗</Link>
        </div>
      </section>

      {error && <p className="form-error">{error}</p>}
      <section className="dashboard-stats" aria-label="Overview statistics">
        <article className="dashboard-stat"><span className="stat-icon">□</span><strong>{loading ? '—' : (emitter ? ownLots.length : availableLots.length)}</strong><span>{emitter ? 'Lots shared' : 'Lots in reach'}</span></article>
        <article className="dashboard-stat"><span className="stat-icon gold">◷</span><strong>{loading ? '—' : (emitter ? reservedCount : receiverReservations)}</strong><span>Active reservations</span></article>
        <article className="dashboard-stat"><span className="stat-icon coral">✓</span><strong>{loading ? '—' : completedCount}</strong><span>Completed transfers</span></article>
        <article className="dashboard-stat"><span className="stat-icon">♧</span><strong>{loading ? '—' : `${savedKg} kg`}</strong><span>Food saved</span></article>
      </section>

      <section className="dashboard-panels">
        <div className="dashboard-panel movement-panel">
          <p className="eyebrow">Recent movement</p>
          <h2>Small actions, real impact.</h2>
          {loading ? <p>Loading activity...</p> : relevantLots.length ? (
            <div className="movement-list">
              {relevantLots.slice(0, 4).map((lot) => (
                <Link className="movement-item" to={`/lots/${lot.id}`} key={lot.id}>
                  <span className="movement-mark">→</span>
                  <span><strong>{lot.title}</strong><small>{emitter ? `${lot.quantity_kg} kg shared · ${lot.location_city}` : `${lot.location_city} · ${lot.status}`}</small></span>
                  <time>{formatDate(lot.created_at)}</time>
                </Link>
              ))}
            </div>
          ) : <p className="dashboard-empty">{emitter ? 'Your shared lots will appear here.' : 'No available lots nearby yet.'}</p>}
        </div>

        <div className="dashboard-panel pathway-panel">
          <p className="eyebrow">By pathway</p>
          <h2>Where things go next.</h2>
          <div className="pathway-bars">
            {pathwayCounts.map((pathway) => (
              <div className="pathway-bar" key={pathway.key}>
                <div><span>{pathway.label}</span><strong>{pathway.count}</strong></div>
                <span className="bar-track"><span style={{ width: `${Math.max(12, pathway.count / totalPathways * 100)}%` }} /></span>
              </div>
            ))}
          </div>
          <p className="pathway-foot">Every pathway keeps something useful in circulation.</p>
        </div>
      </section>
    </div>
  );
}
