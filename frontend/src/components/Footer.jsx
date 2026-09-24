import { Link } from 'react-router-dom';

export default function Footer() {
  const siteUrl = import.meta.env.VITE_PUBLIC_SITE_URL || 'https://stockshare.example';

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <h3>StockShare</h3>
          <p>Good food. Next chapter. We help surplus ingredients reach people, animals, and industry before they become waste.</p>
        </div>
        <div>
          <h4>Platform</h4>
          <ul>
            <li><Link to="/marketplace">Marketplace</Link></li>
            <li><Link to="/auth?mode=signup">Create account</Link></li>
            <li><a href="/#newsletter">Newsletter</a></li>
          </ul>
        </div>
        <div>
          <h4>Company</h4>
          <ul>
            <li><a href="/#contact">Contact</a></li>
            <li><Link to="/terms">Terms of Use</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>Copyright StockShare. All rights reserved.</span>
        <span className="canonical">Canonical link: <a href={siteUrl}>{siteUrl}</a></span>
      </div>
    </footer>
  );
}
