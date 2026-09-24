import express from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { category } = req.query;
  const params = [];
  let sql = 'SELECT l.*, u.full_name AS owner_name, u.organization AS owner_organization FROM lots l JOIN users u ON u.id = l.owner_id';
  if (category) {
    params.push(category);
    sql += ' WHERE l.category = $1';
  }
  sql += ' ORDER BY l.created_at DESC';
  const result = await query(sql, params);
  return res.json({ lots: result.rows });
});

router.get('/:id', async (req, res) => {
  const result = await query(
    'SELECT l.*, u.full_name AS owner_name, u.organization AS owner_organization FROM lots l JOIN users u ON u.id = l.owner_id WHERE l.id = $1',
    [req.params.id]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Lot not found.' });
  }
  return res.json({ lot: result.rows[0] });
});

router.post('/', requireAuth, async (req, res) => {
  const { title, category, description, quantityKg, locationCity, locationCountry, expiryStatus } = req.body;
  if (!title || !locationCity) {
    return res.status(400).json({ error: 'Title and city are required.' });
  }
  const created = await query(
    'INSERT INTO lots (owner_id, title, category, description, quantity_kg, location_city, location_country, expiry_status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
    [req.user.id, title, category || 'human_donation', description || null, Number(quantityKg) || 0, locationCity, locationCountry || 'Tunisia', expiryStatus || 'near_expiry']
  );
  return res.status(201).json({ lot: created.rows[0] });
});

router.post('/:id/reserve', requireAuth, async (req, res) => {
  const lotResult = await query('SELECT * FROM lots WHERE id = $1', [req.params.id]);
  if (lotResult.rows.length === 0) {
    return res.status(404).json({ error: 'Lot not found.' });
  }
  const lot = lotResult.rows[0];
  if (lot.owner_id === req.user.id) {
    return res.status(403).json({ error: 'You cannot reserve a lot you published.' });
  }
  if (lot.status !== 'available') {
    return res.status(409).json({ error: 'This lot is no longer available.' });
  }
  try {
    await query('INSERT INTO reservations (lot_id, reserver_id, message) VALUES ($1,$2,$3)', [lot.id, req.user.id, req.body.message || null]);
  } catch (err) {
    return res.status(409).json({ error: 'You already reserved this lot.' });
  }
  await query('UPDATE lots SET status = $1 WHERE id = $2', ['reserved', lot.id]);
  return res.status(201).json({ ok: true, status: 'reserved' });
});

export default router;
