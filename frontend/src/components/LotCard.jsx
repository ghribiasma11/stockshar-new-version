import { Link } from 'react-router-dom';
import { assetUrl } from '../api.js';

const CATEGORY_LABELS = {
  human_donation: 'Human donation',
  animal_feed: 'Animal feed',
  industrial_recycling: 'Industrial recycling'
};

const CATEGORY_COLORS = {
  human_donation: '#e6cc84',
  animal_feed: '#eccb72',
  industrial_recycling: '#dfaa4d'
};

export default function LotCard({ lot, audience = 'receiver' }) {
  const label = CATEGORY_LABELS[lot.category] || lot.category;
  const color = CATEGORY_COLORS[lot.category] || '#e6cc84';
  const expiry = lot.expiry_status === 'near_expiry' ? 'Near expiry' : 'Fresh';

  return (
    <article className="lot-card">
      <div className="lot-card-head" style={{ backgroundColor: color, ...(lot.image_url ? { backgroundImage: `linear-gradient(rgba(18,57,47,.22), rgba(18,57,47,.12)), url(${assetUrl(lot.image_url)})` } : {}) }}>
        <span className="capsule">{label}</span>
        <span className="watermark">share</span>
        <span className="qty">{lot.quantity_value ?? lot.quantity_kg} {lot.quantity_unit || 'kg'}</span>
      </div>
      <div className="lot-card-body">
        <span className="cat">{label}</span>
        <h3>{lot.title}</h3>
        <p className="lot-meta">{lot.product_condition?.replaceAll('_', ' ') || expiry} · {lot.location_city}</p>
        <div className="foot">
          <span className="lot-card-status-line">{lot.quantity_value ?? lot.quantity_kg} {lot.quantity_unit || 'kg'} · <span className={`status-tag ${lot.status}`}>{lot.status === 'completed' ? 'Picked up' : lot.status}</span></span>
          <Link to={'/lots/' + lot.id}>{audience === 'receiver' && lot.status === 'available' ? 'View & reserve' : 'View details'} →</Link>
        </div>
      </div>
    </article>
  );
}
