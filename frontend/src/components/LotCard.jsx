import { Link } from 'react-router-dom';

const CATEGORY_LABELS = {
  human_donation: 'Human donation',
  animal_feed: 'Animal feed',
  industrial_recycling: 'Industrial recycling'
};

export default function LotCard({ lot }) {
  const categoryLabel = CATEGORY_LABELS[lot.category] || lot.category;
  const expiryLabel = lot.expiry_status === 'near_expiry' ? 'Near expiry' : 'Fresh';

  return (
    <article className="lot-card">
      <h3>{lot.title}</h3>
      <p className="lot-meta">{lot.quantity_kg} kg · {expiryLabel} · {lot.location_city}</p>
      <p className="lot-category">{categoryLabel}</p>
      <Link className="btn btn-secondary" to={'/lots/' + lot.id}>View lot</Link>
    </article>
  );
}
