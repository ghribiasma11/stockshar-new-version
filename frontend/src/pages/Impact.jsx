import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth/AuthContext.jsx';

const CO2_PER_KG = Number(import.meta.env.VITE_IMPACT_CO2_KG_PER_KG || 2.5);
const WATER_M3_PER_KG = Number(import.meta.env.VITE_IMPACT_WATER_M3_PER_KG || 0.0015);

export default function Impact() {
  const { user, loading: authLoading } = useAuth();
  const [transfers, setTransfers] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    if (user) api.get('/lots/transfers/mine').then((data) => setTransfers((data.transfers || []).filter((transfer) => transfer.transfer_status === 'completed'))).catch((err) => setError(err.message));
  }, [user]);
  const metrics = useMemo(() => {
    const kg = transfers.reduce((total, transfer) => total + Number(transfer.quantity_kg || 0), 0);
    return { kg, co2: kg * CO2_PER_KG, water: kg * WATER_M3_PER_KG };
  }, [transfers]);
  if (authLoading) return <p>Loading your impact...</p>;
  if (!user) return <Navigate to="/auth" replace />;
  return <div className="impact-certificate" id="impact-certificate">
    <div className="util-row"><span>StockShare · Impact report</span><Link to="/dashboard">← Dashboard</Link></div>
    <div className="certificate-mark"><span className="brand-mark" /></div>
    <p className="eyebrow">Circular impact certificate</p>
    <h1>Good food kept in circulation.</h1>
    <p className="certificate-owner">Prepared for {user.organization || user.full_name}</p>
    {error && <p className="form-error">{error}</p>}
    <div className="impact-metrics"><div><strong>{metrics.kg.toLocaleString()} kg</strong><span>Ingredients recovered</span></div><div><strong>{metrics.water.toFixed(2)} m³</strong><span>Estimated water preserved</span></div><div><strong>{metrics.co2.toLocaleString()} kg</strong><span>Estimated CO₂ avoided</span></div></div>
    <p className="impact-method">Environmental figures are estimates based on completed transfer weight and StockShare's current impact factors. They are indicative, not a verified lifecycle assessment.</p>
    <button className="btn btn-primary no-print" type="button" onClick={() => window.print()}>Download PDF certificate</button>
  </div>;
}
