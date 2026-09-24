import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import LotCard from '../components/LotCard.jsx';
import { useAuth } from '../auth/AuthContext.jsx';

const PATHWAYS = [
  {
    title: 'Human donation',
    body: 'Fresh ingredients find associations, kitchens, and families who can use them now.'
  },
  {
    title: 'Animal feed',
    body: 'Safe, nutritious surplus gets redirected to farms and animal-care partners.'
  },
  {
    title: 'Industrial recycling',
    body: 'Ingredients and raw materials become inputs for another useful process.'
  }
];

export default function Landing() {
  const { user } = useAuth();
  const [lots, setLots] = useState([]);
  const [contact, setContact] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactStatus, setContactStatus] = useState('');

  useEffect(() => {
    const siteUrl = import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin;
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', siteUrl);
  }, []);

  useEffect(() => {
    if (!user) {
      setLots([]);
      return;
    }
    api
      .get('/lots')
      .then((data) => setLots(data.lots.slice(0, 3)))
      .catch(() => setLots([]));
  }, [user]);

  async function sendContact(event) {
    event.preventDefault();
    setContactStatus('Sending...');
    try {
      await api.post('/contact', contact);
      setContactStatus('Message sent. We will get back to you shortly.');
      setContact({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setContactStatus(err.message);
    }
  }

  const featured = lots[0];

  return (
    <div>
      <section className="hero">
        <span className="ring ring-a" />
        <span className="ring ring-b" />
        <div className="hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">Food should keep moving</p>
            <h1>Good food.<span>Next chapter.</span></h1>
            <p className="lede">
              StockShare helps businesses pass surplus ingredients to people, animals, and industry — before they become waste.
            </p>
            <div className="hero-actions">
              <Link to={user ? '/marketplace' : '/auth'} className="btn btn-yellow">Explore available lots <span aria-hidden="true">↗</span></Link>
              <Link to={user ? '/declare' : '/auth?mode=signup'} className="btn btn-secondary">
                I have surplus <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div className="hero-card">
            <div className="hero-card-inner">
              <div className="hero-card-top"><span>Live on StockShare</span><strong>Just added</strong></div>
              <div className="hero-product-art" aria-label="Surplus ingredients finding a new destination">
                <span className="produce-orbit produce-orbit-one" />
                <span className="produce-orbit produce-orbit-two" />
                <span className="produce-shape produce-apple" />
                <span className="produce-shape produce-orange" />
                <span className="produce-shape produce-leaf" />
                
              </div>
              <div className="hero-card-details">
                <h3>{user && featured ? featured.title : 'Golden orchard apples'}</h3>
                <div className="hero-card-meta"><span>{user && featured ? `${featured.quantity_value ?? featured.quantity_kg} ${featured.quantity_unit || 'kg'}` : '120 kg'} · Near expiry</span><span>⌖ &nbsp;{user && featured ? featured.location_city : 'Tunis'}</span></div>
                <div className="hero-card-foot"><span>♧ &nbsp;{user && featured ? `${featured.quantity_kg} kg saved` : '120 kg saved'}</span><strong>Human donation</strong></div>
              </div>
            </div>
            <span className="status-pill">✓ &nbsp;A real second life</span>
          </div>
        </div>
      </section>

      <section className="section ivory" id="why-stockshare">
        <div className="section-inner section split">
          <div>
            <p className="eyebrow">A real second life</p>
            <h2>Waste is a design flaw.</h2>
          </div>
          <div>
            <p>
              There is no such thing as just surplus when the right people can use it. StockShare makes that connection
              simple, visible, and dependable.
            </p>
            <div className="divider" />
            <div className="stats">
              <div className="stat"><strong>3</strong><span>pathways for every lot</span></div>
              <div className="stat"><strong>1</strong><span>shared local marketplace</span></div>
              <div className="stat"><strong>0</strong><span>good ingredients wasted</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="circular-path">
        <div className="section-inner">
          <p className="eyebrow">The circular path</p>
          <h2>A better hand-off.</h2>
          <p>From a back-of-house fridge to a family table, a feed mill, or a new material.</p>
          <div className="pathway-grid">
            {PATHWAYS.map((pathway, index) => (
              <div className="pathway" key={pathway.title}>
                <span className="pathway-index">{String(index + 1).padStart(2, '0')}</span>
                <h3>{pathway.title}</h3>
                <p>{pathway.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {user && <section className="section ivory">
        <div className="section-inner">
          <div className="page-head">
            <div>
              <p className="eyebrow">Available now</p>
              <h2>Lots looking for a next chapter.</h2>
            </div>
            <Link to="/marketplace" className="btn btn-secondary">See the marketplace</Link>
          </div>
          <div className="lot-grid">
            {lots.map((lot) => (
              <LotCard key={lot.id} lot={lot} />
            ))}
          </div>
        </div>
      </section>}

      <section id="contact" className="section ivory">
        <div className="section-inner section split">
          <div>
            <p className="eyebrow">Contact</p>
            <h2>Talk to the StockShare team.</h2>
          </div>
          <div>
            <form onSubmit={sendContact} className="contact-form">
              <input
                required
                placeholder="Your name"
                value={contact.name}
                onChange={(e) => setContact({ ...contact, name: e.target.value })}
              />
              <input
                required
                type="email"
                placeholder="Your email"
                value={contact.email}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
              />
              <input
                placeholder="Subject"
                value={contact.subject}
                onChange={(e) => setContact({ ...contact, subject: e.target.value })}
              />
              <textarea
                required
                rows="4"
                placeholder="How can we help?"
                value={contact.message}
                onChange={(e) => setContact({ ...contact, message: e.target.value })}
              />
              <button type="submit" className="btn btn-primary">Send message</button>
            </form>
            {contactStatus && <p className="form-status">{contactStatus}</p>}
          </div>
        </div>
      </section>

      <section className="final-cta">
        <p className="eyebrow">Start where you are</p>
        <h2>The next chapter starts with one lot.</h2>
        <Link to="/auth" className="btn btn-yellow">Create your account</Link>
      </section>
    </div>
  );
}
