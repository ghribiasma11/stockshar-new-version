import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import LotCard from '../components/LotCard.jsx';
import { useAuth } from '../auth/AuthContext.jsx';

const CATEGORIES = [
  { value: '', label: 'All categories' },
  { value: 'human_donation', label: 'Human donation' },
  { value: 'animal_feed', label: 'Animal feed' },
  { value: 'industrial_recycling', label: 'Industrial recycling' }
];

const INGREDIENTS = [
  { value: '', label: 'All ingredients' },
  { value: 'grains_flour', label: 'Cereals & flour' },
  { value: 'meat_poultry', label: 'Meat & poultry' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'starches_rice_pasta', label: 'Starches, rice & pasta' },
  { value: 'oils_fats', label: 'Oils & fats' },
  { value: 'groceries_canned', label: 'Groceries & canned goods' },
  { value: 'sugar_semolina_spices', label: 'Sugar, semolina & spices' }
];
const CONDITIONS = [
  { value: '', label: 'All conditions' },
  { value: 'intact', label: 'Intact surplus' },
  { value: 'damaged_packaging', label: 'Damaged packaging' },
  { value: 'short_date', label: 'Short date' },
  { value: 'expired', label: 'Not for human use' }
];

export default function Marketplace() {
  const [lots, setLots] = useState([]);
  const [category, setCategory] = useState('');
  const [pathway, setPathway] = useState('');
  const [condition, setCondition] = useState('');
  const [city, setCity] = useState('');
  const [minQuantity, setMinQuantity] = useState('');
  const [maxQuantity, setMaxQuantity] = useState('');
  const [sort, setSort] = useState('recent');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const receiver = user?.role === 'receiver' || !user;

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (pathway) params.set('pathway', pathway);
    if (condition) params.set('condition', condition);
    if (city) params.set('city', city);
    if (minQuantity) params.set('minQuantity', minQuantity);
    if (maxQuantity) params.set('maxQuantity', maxQuantity);
    if (query.trim()) params.set('search', query.trim());
    if (sort !== 'recent') params.set('sort', sort);
    if (user?.role === 'receiver') params.set('includeUnavailable', 'true');
    api
      .get('/lots' + (params.size ? '?' + params.toString() : ''))
      .then((data) => setLots(data.lots))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [category, pathway, condition, city, minQuantity, maxQuantity, sort, query, user]);

  const needle = query.trim().toLowerCase();
  const visible = needle
    ? lots.filter((lot) => {
        const haystack = [lot.title, lot.location_city, lot.description].join(' ').toLowerCase();
        return haystack.indexOf(needle) !== -1;
      })
    : lots;

  return (
    <div className={`marketplace-page ${receiver ? 'marketplace-receiver' : 'marketplace-emitter'}`}>
      <div className="util-row"><span>{receiver ? 'A shared place for surplus' : 'Emitter workspace · marketplace'}</span><span>{receiver ? 'Browse available lots' : 'Find a next use for surplus'}</span></div>

      <div className="page-head">
        <div>
          <p className="eyebrow">{receiver ? 'Available surplus' : 'Circular supply'}</p>
          <h1>{receiver ? 'Find available lots.' : 'Marketplace.'}</h1>
          <p>{receiver ? 'Find useful ingredients nearby and reserve a safe hand-off.' : 'Browse local offers, then share your own surplus with the right pathway.'}</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => navigate(user?.role === 'emitter' ? '/declare' : user ? '/transfers' : '/auth')}>
          {user?.role === 'emitter' ? 'Declare a lot' : user ? 'My transfers' : 'Sign in to reserve'}
        </button>
      </div>

      <div className="filters">
        <input
          placeholder="Search lots, cities..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select aria-label="Filter by pathway" value={pathway} onChange={(e) => setPathway(e.target.value)}>{CATEGORIES.map((option) => <option key={option.value} value={option.value}>{option.value ? option.label : 'All pathways'}</option>)}</select>
        <select aria-label="Filter by ingredient" value={category} onChange={(e) => setCategory(e.target.value)}>{INGREDIENTS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
        <select aria-label="Filter by condition" value={condition} onChange={(e) => setCondition(e.target.value)}>{CONDITIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
        <input aria-label="Filter by city" placeholder="City or governorate" value={city} onChange={(e) => setCity(e.target.value)} />
        <input aria-label="Minimum quantity in kilograms" type="number" min="0" placeholder="Min kg" value={minQuantity} onChange={(e) => setMinQuantity(e.target.value)} />
        <input aria-label="Maximum quantity in kilograms" type="number" min="0" placeholder="Max kg" value={maxQuantity} onChange={(e) => setMaxQuantity(e.target.value)} />
        <select aria-label="Sort lots" value={sort} onChange={(e) => setSort(e.target.value)}><option value="recent">Most recent</option><option value="pickup">Pickup urgency</option></select>
      </div>

      <div className="result-row">
        <span>{visible.length} lots</span>
        <span>{sort === 'pickup' ? 'Pickup urgency' : 'Most recent'}</span>
      </div>

      {loading && <p>Loading lots...</p>}
      {error && <p className="form-error">{error}</p>}
      {!loading && visible.length === 0 && <p>No lots match this filter yet.</p>}

      <div className="lot-grid">
        {visible.map((lot) => (
          <LotCard key={lot.id} lot={lot} audience={receiver ? 'receiver' : 'emitter'} />
        ))}
      </div>
    </div>
  );
}
