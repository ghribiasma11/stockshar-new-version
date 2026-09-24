import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Footer from './components/Footer.jsx';
import Landing from './pages/Landing.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Marketplace from './pages/Marketplace.jsx';
import LotDetail from './pages/LotDetail.jsx';
import Profile from './pages/Profile.jsx';
import Account from './pages/Account.jsx';
import Terms from './pages/Terms.jsx';
import Privacy from './pages/Privacy.jsx';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/lots/:id" element={<LotDetail />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/account" element={<Account />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
    </Routes>
  );
}

export default function App() {
  const location = useLocation();
  const path = location.pathname;

  if (path === '/auth') {
    return <AppRoutes />;
  }

  const appPaths = ['/marketplace', '/profile', '/account'];
  const isApp = appPaths.includes(path) || path.indexOf('/lots/') === 0;

  if (isApp) {
    return (
      <div className="app-body">
        <Sidebar />
        <main className="canvas">
          <div className="canvas-inner">
            <AppRoutes />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <main>
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
}
