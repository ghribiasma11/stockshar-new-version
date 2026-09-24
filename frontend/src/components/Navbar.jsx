import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const onDark = location.pathname === '/';

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <header className={onDark ? 'site-header' : 'site-header light'}>
      <Link to="/" className="brand">
        <span className="brand-mark" />
        <span className="brand-word">StockShare</span>
      </Link>
      <nav className="site-nav">
        <Link to="/marketplace">Marketplace</Link>
        <Link to="/terms">Terms</Link>
        {user ? (
          <>
            <Link to="/profile">Profile</Link>
            <button type="button" className="btn btn-yellow" onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <>
            <Link to="/auth">Sign in</Link>
            <Link to="/auth?mode=signup" className="btn btn-yellow">Join StockShare</Link>
          </>
        )}
      </nav>
    </header>
  );
}
