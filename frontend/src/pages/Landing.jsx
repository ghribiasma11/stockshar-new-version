import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import LotCard from '../components/LotCard.jsx';

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
  const [lots, setLots] = useState([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');
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
    api
      .get('/lots')
      .then((data) => setLots(data.lots.slice(0, 3)))
      .catch(() => setLots([]));
  }, []);

  async function subscribe(event) {
    event.preventDefault();
    setNewsletterStatus('Subscribing...');
    try {
      await api.post('/newsletter', { email: newsletterEmail });
      setNewsletterStatus('You are subscribed. Thank you!');
      setNewsletterEmail('');
    } catch (err) {
      setNewsletterStatus(err.message);
    }
  }

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
    <div className="landing">
      <section className="hero">
        <p className="eyebrow">Food should keep moving</p>
        <h1>Good food. Next chapter.</h1>
        <p className="lede">
          StockShare helps businesses pass surplus ingredients to people, animals, and industry before they become waste.
        </p>
        <div className="hero-actions">
          <Link to="/marketplace" className="btn btn-primary">Explore available lots</Link>
          <Link to="/auth" className="btn btn-secondary">I have surplus</Link>
        </div>
      </section>

      {featured && (
        <section className="live-section">
          <p className="eyebrow">Live on StockShare</p>
          <h2>Just added</h2>
          <div className="live-card">
            <p className="live-tag">move it forward</p>
            <h3>{featured.title}</h3>
            <p className="lot-meta">
              {featured.quantity_kg} kg · {featured.expiry_status === 'near_expiry' ? 'Near expiry' : 'Fresh'} {featured.location_city}
            </p>
            <p className="live-saved">{featured.quantity_kg} kg saved · Human donation</p>
          </div>
        </section>
      )}

      <section className="premise">
        <p className="eyebrow">A real second life</p>
        <h2>Waste is a design flaw.</h2>
        <p>
          There is no such thing as just surplus when the right people can use it. StockShare makes that connection
          simple, visible, and dependable.
        </p>
        <div className="stats">
          <div className="stat"><strong>3</strong><span>pathways for every lot</span></div>
          <div className="stat"><strong>1</strong><span>shared local marketplace</span></div>
          <div className="stat"><strong>0</strong><span>good ingredients wasted</span></div>
        </div>
      </section>

      <section className="pathways">
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
      </section>

      <section className="market-preview">
        <p className="eyebrow">Available now</p>
        <h2>Lots looking for a next chapter.</h2>
        <div className="lot-grid">
          {lots.map((lot) => (
            <LotCard key={lot.id} lot={lot} />
          ))}
        </div>
        <Link to="/marketplace" className="btn btn-secondary">See the marketplace</Link>
      </section>

      <section id="newsletter" className="newsletter">
        <p className="eyebrow">Newsletter</p>
        <h2>Stay in the loop.</h2>
        <p>Monthly stories about the lots that found a second life, plus product updates.</p>
        <form onSubmit={subscribe} className="inline-form">
          <input
            type="email"
            required
            placeholder="you@company.com"
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Subscribe</button>
        </form>
        {newsletterStatus && <p className="form-status">{newsletterStatus}</p>}
      </section>

      <section id="contact" className="contact">
        <p className="eyebrow">Contact</p>
        <h2>Talk to the StockShare team.</h2>
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
      </section>

      <section className="final-cta">
        <p className="eyebrow">Start where you are</p>
        <h2>The next chapter starts with one lot.</h2>
        <Link to="/auth" className="btn btn-primary">Create your account</Link>
      </section>
    </div>
  );
}
