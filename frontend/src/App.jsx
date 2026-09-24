import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Landing from './pages/Landing.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Marketplace from './pages/Marketplace.jsx';
import LotDetail from './pages/LotDetail.jsx';
import Profile from './pages/Profile.jsx';
import Account from './pages/Account.jsx';
import Terms from './pages/Terms.jsx';
import Privacy from './pages/Privacy.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main>
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
      </main>
      <Footer />
    </div>
  );
}
