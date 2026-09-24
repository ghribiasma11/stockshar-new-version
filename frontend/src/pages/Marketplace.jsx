import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api
      .get(category ? '/lots?category=' + category : '/lots')
      .then((data) => setLots(data.lots))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [category]);

  const needle = query.trim().toLowerCase();
  const visible = needle
    ? lots.filter((lot) => {
        const haystack = [lot.title, lot.location_city, lot.description].join(' ').toLowerCase();
        return haystack.indexOf(needle) !== -1;
      })
    : lots;

  return (
    <div>
      <div className="util-row"><span>Browse available lots</span></div>

      <div className="page-head">
        <div>
          <h1>Marketplace</h1>
          <p>Surplus lots available for donation, animal feed, or recycling.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/auth?mode=signup')}>
          Declare surplus
        </button>
      </div>

      <div className="filters">
        <input
          placeholder="Search lots, cities..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <div className="result-row">
        <span>{visible.length} lots</span>
        <span>Most recent</span>
      </div>

      {loading && <p>Loading lots...</p>}
      {error && <p className="form-error">{error}</p>}
      {!loading && visible.length === 0 && <p>No lots match this filter yet.</p>}

      <div className="lot-grid">
        {visible.map((lot) => (
          <LotCard key={lot.id} lot={lot} />
        ))}
      </div>
    </div>
  );
}
