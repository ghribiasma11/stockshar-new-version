import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

const ITEMS = [
  { to: '/marketplace', label: 'Marketplace', glyph: '◧' },
  { to: '/profile', label: 'Profile', glyph: '◍' },
  { to: '/account', label: 'Account', glyph: '⚙' }
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <aside className="sidebar">
      <Link to="/" className="brand">
        <span className="brand-mark" />
        <span className="brand-word">StockShare</span>
      </Link>
      {ITEMS.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={location.pathname === item.to ? 'nav-item active' : 'nav-item'}
        >
          <span className="nav-glyph">{item.glyph}</span>
          <span>{item.label}</span>
        </Link>
      ))}
      {user ? (
        <button type="button" className="nav-item" onClick={handleLogout}>Log out</button>
      ) : (
        <Link to="/auth" className="nav-item">
          <span className="nav-glyph">→</span>
          <span>Sign in</span>
        </Link>
      )}
      <div className="climate-card">
        <strong>Climate impact</strong>
        Every lot redirected avoids CO2 and keeps good food in use.
      </div>
    </aside>
  );
}
