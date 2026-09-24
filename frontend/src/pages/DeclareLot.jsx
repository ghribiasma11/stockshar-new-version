import { useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth/AuthContext.jsx';

const INITIAL = { title: '', category: 'human_donation', ingredientCategory: 'grains_flour', productCondition: 'intact', quantityKg: '', quantityUnit: 'kg', locationCity: '', locationCountry: 'Tunisia', expiryStatus: 'fresh', pickupAt: '', pickupAddress: '', description: '', imageUrl: '' };

export default function DeclareLot() {
  const { user, loading } = useAuth();
  const [form, setForm] = useState(INITIAL);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [photo, setPhoto] = useState(null);
  const fileRef = useRef(null);
  const navigate = useNavigate();
  if (loading) return <p>Loading your workspace...</p>;
  if (!user) return <Navigate to="/auth" replace />;
  if (user.role !== 'emitter') return <Navigate to="/marketplace" replace />;

  function update(field, value) { setForm((current) => ({ ...current, [field]: value })); }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const values = { ...form, pickupAt: new Date(form.pickupAt).toISOString() };
      if (photo) {
        const upload = new FormData();
        upload.append('photo', photo);
        const image = await api.upload('/lots/image', upload);
        values.imageUrl = image.imageUrl;
      }
      const result = await api.post('/lots', values);
      navigate(`/lots/${result.lot.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="util-row"><span>Emitter workspace</span></div>
      <div className="page-head"><div><p className="eyebrow">Share surplus</p><h1>Declare a lot.</h1><p>Clear details help the right receiver move quickly.</p></div><Link className="back-link" to="/my-lots">Your lots</Link></div>
      <div className="workflow-grid">
        <form className="panel workflow-form" onSubmit={submit}>
          <label>What are you sharing?<input required maxLength="120" placeholder="e.g. 40 kg fresh tomatoes" value={form.title} onChange={(event) => update('title', event.target.value)} /></label>
          <div className="form-columns form-columns-three">
            <label>Ingredient category<select required value={form.ingredientCategory} onChange={(event) => update('ingredientCategory', event.target.value)}><option value="grains_flour">Cereals & flour</option><option value="meat_poultry">Meat & poultry</option><option value="dairy">Dairy</option><option value="starches_rice_pasta">Starches, rice & pasta</option><option value="oils_fats">Oils & fats</option><option value="groceries_canned">Groceries & canned goods</option><option value="sugar_semolina_spices">Sugar, semolina & spices</option></select></label>
            <label>Quantity<input required type="number" min="0.1" step="0.1" value={form.quantityKg} onChange={(event) => update('quantityKg', event.target.value)} /></label>
            <label>Unit<select required value={form.quantityUnit} onChange={(event) => update('quantityUnit', event.target.value)}><option value="kg">Kg</option><option value="tonnes">Tonnes</option><option value="bags">Bags</option><option value="cartons">Cartons</option><option value="litres">Litres</option><option value="drums">Drums</option></select></label>
          </div>
          <div className="form-columns">
            <label>Product condition<select required value={form.productCondition} onChange={(event) => update('productCondition', event.target.value)}><option value="intact">Compliant surplus · original packaging</option><option value="damaged_packaging">Damaged packaging · off-spec</option><option value="short_date">Short date · near expiry</option><option value="expired">Expired · not for human consumption</option></select></label>
            <label>Pickup date and time<input required type="datetime-local" min={new Date().toISOString().slice(0, 16)} value={form.pickupAt} onChange={(event) => update('pickupAt', event.target.value)} /></label>
          </div>
          <label>Pickup address<input required placeholder="Street, access notes, building..." value={form.pickupAddress} onChange={(event) => update('pickupAddress', event.target.value)} /></label>
          <div className="form-columns"><label>City<input required value={form.locationCity} onChange={(event) => update('locationCity', event.target.value)} /></label><label>Country<input value={form.locationCountry} onChange={(event) => update('locationCountry', event.target.value)} /></label></div>
          <label>Product photo (optional)<input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setPhoto(event.target.files?.[0] || null)} /><small className="field-hint">JPEG, PNG, or WEBP · max 5 MB</small></label>
          <label>A few words about this lot<textarea rows="4" placeholder="How should it be handled? What makes this surplus useful?" value={form.description} onChange={(event) => update('description', event.target.value)} /></label>
          {error && <p className="form-error">{error}</p>}
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Publishing...' : 'Publish lot'}</button>
        </form>
        <aside className="workflow-note"><strong>A trusted hand-off</strong><p>Your lot will be visible to verified receivers nearby. They receive a pickup PIN when they reserve it.</p><ul><li>Be specific about condition and access.</li><li>Choose a pickup deadline you can keep.</li><li>A small hand-off can make a measurable difference.</li></ul></aside>
      </div>
    </div>
  );
}
