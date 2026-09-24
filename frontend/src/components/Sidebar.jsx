import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { useState } from 'react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = [
    { to: '/dashboard', label: 'Overview', glyph: '◉' },
    { to: '/marketplace', label: 'Marketplace', glyph: '▤' },
    ...(user?.role === 'emitter' ? [
      { to: '/declare', label: 'Declare a lot', glyph: '+' },
      { to: '/my-lots', label: 'My lots', glyph: '□' }
    ] : []),
    { to: '/transfers', label: 'Transfers', glyph: '⇄' }
  ];

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <Link to="/" className="brand">
        <span className="brand-mark" />
        <span className="brand-word">StockShare</span>
      </Link>
      <button type="button" className="sidebar-mobile-toggle" aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)}>
        <span /><span /><span />
      </button>
      <div className="sidebar-nav">
        <span className="sidebar-label">Your workspace</span>
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={location.pathname === item.to ? 'nav-item active pill' : 'nav-item'}
            onClick={() => setMobileOpen(false)}
          >
            <span className="nav-glyph">{item.glyph}</span>
            <span>{item.label}</span>
          </Link>
        ))}

      </div>
      <div className="climate-card"><strong>Circular note</strong>Every transfer is a small act of climate care.</div>
      {user && <div className="sidebar-user">
        <button type="button" className="sidebar-user-trigger" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          <span className="avatar-small">{(user.full_name || user.email).charAt(0)}</span>
          <span className="user-meta"><span className="user-name">{user.full_name || user.email}</span><span className="user-role">{user.role === 'emitter' ? 'Emitter' : 'Receiver'}</span></span>
          <span className="user-menu-caret" aria-hidden="true">⌄</span>
        </button>
        {menuOpen && <div className="sidebar-user-actions">
          <Link to="/profile" className="nav-item" onClick={() => setMenuOpen(false)}>Profile</Link>
          <Link to="/account" className="nav-item" onClick={() => setMenuOpen(false)}>Account</Link>
          <button type="button" className="nav-item" onClick={handleLogout}>Log out</button>
        </div>}
      </div>}
    </aside>
  );
}
