import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, assetUrl } from '../api.js';
import { useAuth } from '../auth/AuthContext.jsx';

export default function LotDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [lot, setLot] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const pathwayLabels = {
    human_donation: 'Human donation',
    animal_feed: 'Animal feed',
    industrial_recycling: 'Industrial recycling'
  };
  const ingredientLabels = {
    grains_flour: 'Cereals & flour',
    meat_poultry: 'Meat & poultry',
    dairy: 'Dairy',
    starches_rice_pasta: 'Starches, rice & pasta',
    oils_fats: 'Oils & fats',
    groceries_canned: 'Groceries & canned goods',
    sugar_semolina_spices: 'Sugar, semolina & spices'
  };

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

  const isOwner = Boolean(user) && Number(user.id) === Number(lot.owner_id);
  const canReserve = user?.role === 'receiver' && !isOwner && lot.status === 'available';
  const quantity = lot.quantity_value ?? lot.quantity_kg;
  const unit = lot.quantity_unit || 'kg';
  const condition = (lot.product_condition || lot.expiry_status || 'intact').replaceAll('_', ' ');
  const pathway = pathwayLabels[lot.category] || lot.category;

  return (
    <div className="lot-detail-page">
      <div className="util-row detail-util"><span>A shared place for surplus</span><Link to="/marketplace">⌕ &nbsp; Browse available lots</Link></div>
      <Link to="/marketplace" className="back-link">← Back to marketplace</Link>
      <div className="lot-detail-layout">
        <div className={`detail-visual ${lot.image_url ? 'has-image' : ''}`} style={lot.image_url ? { backgroundImage: `url(${assetUrl(lot.image_url)})` } : undefined}>
          {!lot.image_url && <><span className="detail-visual-orbit" /><span className="detail-visual-watermark">share</span></>}
          <span className="detail-pathway-tag">{pathway}</span>
        </div>
        <div className="lot-detail-content">
          <p className="eyebrow detail-eyebrow">{ingredientLabels[lot.ingredient_category] || pathway} · {lot.location_city}</p>
          <h1>{lot.title}</h1>
          <p className="detail-description">{lot.description || 'Surplus ingredients, ready for a new use.'}</p>

          <div className="detail-metrics">
            <div><span>Quantity</span><strong>{quantity} {unit}</strong></div>
            <div><span>Condition</span><strong>{condition}</strong></div>
            <div><span>Pickup by</span><strong>{lot.pickup_at ? new Date(lot.pickup_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Arrange with publisher'}</strong></div>
            <div><span>Impact</span><strong>{Number(lot.quantity_kg || 0)} kg potential recovery</strong></div>
          </div>

          <div className="detail-address"><span className="address-icon">⌖</span><div><strong>{lot.pickup_address || lot.location_city}</strong><span>{lot.location_city}, {lot.location_country}</span></div></div>
          <div className="detail-publisher">Shared by <strong>{lot.owner_organization || lot.owner_name}</strong></div>

          {canReserve && <div className="detail-reserve-panel">
            <div><strong>Reserve this lot for</strong><span className="route-chips"><span className={lot.category === 'human_donation' ? 'selected' : ''}>Human donation</span><span className={lot.category === 'animal_feed' ? 'selected' : ''}>Animal feed</span><span className={lot.category === 'industrial_recycling' ? 'selected' : ''}>Industrial recycling</span></span></div>
            <button type="button" className="btn btn-primary btn-block" onClick={reserve}>Reserve this lot <span aria-hidden="true">→</span></button>
          </div>}
          {user?.role === 'receiver' && !canReserve && <div className="detail-reserve-panel detail-status-panel"><strong>{lot.status === 'completed' ? 'This lot has been picked up.' : lot.status === 'reserved' ? 'This lot is already reserved.' : 'This lot is no longer available.'}</strong><Link to="/transfers">View your transfers →</Link></div>}
          {!user && <p className="detail-signin"><Link to="/auth">Sign in</Link> as a receiver to reserve this lot.</p>}
          {status && <p className={status.startsWith('Reservation confirmed') ? 'form-status' : 'form-error'}>{status}</p>}
        </div>
      </div>
    </div>
  );
}
