import express from 'express';
import { query } from '../db.js';

const router = express.Router();

router.post('/newsletter', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }
  await query('INSERT INTO newsletter_subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING', [email.toLowerCase()]);
  return res.status(201).json({ ok: true });
});

router.post('/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required.' });
  }
  await query('INSERT INTO contact_messages (name, email, subject, message) VALUES ($1,$2,$3,$4)', [name, email, subject || null, message]);
  return res.status(201).json({ ok: true });
});

export default router;
