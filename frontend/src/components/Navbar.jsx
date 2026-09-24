import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <header className="navbar">
      <Link to="/" className="brand">StockShare</Link>
      <nav className="nav-links">
        <Link to="/marketplace">Marketplace</Link>
        {user ? (
          <>
            <Link to="/profile">Profile</Link>
            <Link to="/account">Account</Link>
            <button type="button" className="btn btn-ghost" onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <>
            <Link to="/auth">Sign in</Link>
            <Link to="/auth?mode=signup" className="btn btn-primary">Create account</Link>
          </>
        )}
      </nav>
    </header>
  );
}
