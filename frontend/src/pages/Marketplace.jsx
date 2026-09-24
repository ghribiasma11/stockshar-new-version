import { useEffect, useState } from 'react';
import { api } from '../api.js';
import LotCard from '../components/LotCard.jsx';

const CATEGORIES = [
  { value: '', label: 'All categories' },
  { value: 'human_donation', label: 'Human donation' },
  { value: 'animal_feed', label: 'Animal feed' },
  { value: 'industrial_recycling', label: 'Industrial recycling' }
];

export default function Marketplace() {
  const [lots, setLots] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api
      .get(category ? '/lots?category=' + category : '/lots')
      .then((data) => setLots(data.lots))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="page marketplace">
      <header className="page-header">
        <h1>Marketplace</h1>
        <p>Surplus lots available for donation, animal feed, or recycling.</p>
      </header>

      <div className="filter-row">
        <label>Filter by category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      {loading && <p>Loading lots...</p>}
      {error && <p className="form-error">{error}</p>}
      {!loading && lots.length === 0 && <p>No lots match this filter yet.</p>}

      <div className="lot-grid">
        {lots.map((lot) => (
          <LotCard key={lot.id} lot={lot} />
        ))}
      </div>
    </div>
  );
}
