import express from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import { signToken, requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, organization, city, role, acceptedTerms } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }
    if (!acceptedTerms) {
      return res.status(400).json({ error: 'You must accept the Terms of Use and Privacy Policy.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    const hash = await bcrypt.hash(password, 10);
    const created = await query(
      'INSERT INTO users (email, password_hash, full_name, organization, city, role, accepted_terms) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, email, full_name, role, account_status, avatar_url, organization, city, phone',
      [email.toLowerCase(), hash, fullName, organization || null, city || null, role === 'emitter' ? 'emitter' : 'receiver', true]
    );
    const user = created.rows[0];
    return res.status(201).json({ token: signToken(user), user });
  } catch (err) {
    return res.status(500).json({ error: 'Registration failed.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const found = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (found.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const user = found.rows[0];
    if (user.account_status === 'deactivated') {
      return res.status(403).json({ error: 'This account is deactivated. Reactivate it to sign in.' });
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const publicUser = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      account_status: user.account_status,
      avatar_url: user.avatar_url,
      organization: user.organization,
      city: user.city,
      phone: user.phone
    };
    return res.json({ token: signToken(user), user: publicUser });
  } catch (err) {
    return res.status(500).json({ error: 'Login failed.' });
  }
});

router.post('/logout', requireAuth, (req, res) => {
  return res.json({ ok: true });
});

router.get('/me', requireAuth, async (req, res) => {
  const found = await query(
    'SELECT id, email, full_name, role, account_status, avatar_url, organization, city, phone, created_at FROM users WHERE id = $1',
    [req.user.id]
  );
  if (found.rows.length === 0) {
    return res.status(404).json({ error: 'Account not found.' });
  }
  return res.json({ user: found.rows[0] });
});

export default router;
