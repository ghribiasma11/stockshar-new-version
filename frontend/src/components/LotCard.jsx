import { Link } from 'react-router-dom';

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

export default function LotCard({ lot }) {
  const label = CATEGORY_LABELS[lot.category] || lot.category;
  const color = CATEGORY_COLORS[lot.category] || '#e6cc84';
  const expiry = lot.expiry_status === 'near_expiry' ? 'Near expiry' : 'Fresh';

  return (
    <article className="lot-card">
      <div className="lot-card-head" style={{ background: color }}>
        <span className="capsule">{label}</span>
        <span className="watermark">share</span>
        <span className="qty">{lot.quantity_kg} kg</span>
      </div>
      <div className="lot-card-body">
        <span className="cat">{label}</span>
        <h3>{lot.title}</h3>
        <p className="lot-meta">{expiry} · {lot.location_city}</p>
        <div className="foot">
          <span>{lot.quantity_kg} kg saved</span>
          <Link to={'/lots/' + lot.id}>Open →</Link>
        </div>
      </div>
    </article>
  );
}
