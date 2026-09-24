import { Link } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../api.js';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  async function subscribe(event) {
    event.preventDefault();
    setStatus('Subscribing...');
    try {
      await api.post('/newsletter', { email });
      setStatus('You are subscribed. Thank you!');
      setEmail('');
    } catch (error) {
      setStatus(error.message);
    }
  }

  return (
    <footer className="site-footer">
      <section id="newsletter" className="footer-newsletter">
        <div><p className="eyebrow">Newsletter</p><h2>Stay in the loop.</h2><p>Monthly stories about the lots that found a second life, plus product updates.</p></div>
        <div><form onSubmit={subscribe} className="inline-form"><input type="email" required placeholder="you@company.com" value={email} onChange={(event) => setEmail(event.target.value)} /><button type="submit" className="btn btn-yellow">Subscribe</button></form>{status && <p className="footer-newsletter-status">{status}</p>}</div>
      </section>
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
      </div>
    </footer>
  );
}
