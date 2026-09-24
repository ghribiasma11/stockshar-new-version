import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { useEffect, useRef, useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const onDark = location.pathname === '/';
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  useEffect(() => {
    function onDoc(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  return (
    <header className={onDark ? 'site-header landing-header' : 'site-header light'}>
      <Link to="/" className="brand">
        <span className="brand-mark" />
        <span className="brand-word">StockShare</span>
      </Link>
      <nav className="site-nav">
        {onDark ? (
          <>
            <div className="landing-nav-links">
              <a href="#why-stockshare">Why StockShare</a>
              <a href="#circular-path">The circular path</a>
              <a href="#contact">Contact</a>
            </div>
            {user
              ? <Link to="/dashboard" className="landing-nav-cta">Dashboard</Link>
              : <Link to="/auth?mode=signup" className="landing-nav-cta">Join StockShare</Link>}
          </>
        ) : (
          <>
            <Link to="/marketplace">Marketplace</Link>
            <Link to="/terms">Terms</Link>
            {user ? (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <div className="user-toggle" ref={menuRef}>
                  <button type="button" className="btn" onClick={() => setMenuOpen((s) => !s)}>
                    {user.full_name || user.email}
                  </button>
                  {menuOpen && (
                    <div className="user-menu">
                      <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
                      <Link to="/account" onClick={() => setMenuOpen(false)}>Account</Link>
                      <button type="button" onClick={handleLogout}>Log out</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/auth">Sign in</Link>
                <Link to="/auth?mode=signup" className="btn btn-yellow">Sign up</Link>
              </>
            )}
          </>
        )}
      </nav>
    </header>
  );
}
