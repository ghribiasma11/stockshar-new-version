import express from 'express';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import multer from 'multer';
import { pool, query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, callback) => {
  callback(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype));
} });

router.post('/image', requireAuth, upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Choose a JPEG, PNG, or WEBP image up to 5 MB.' });
  const extension = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' }[req.file.mimetype];
  const directory = path.join(process.cwd(), 'uploads');
  fs.mkdirSync(directory, { recursive: true });
  const filename = randomUUID() + extension;
  fs.writeFileSync(path.join(directory, filename), req.file.buffer);
  return res.status(201).json({ imageUrl: '/uploads/' + filename });
});

router.get('/', async (req, res) => {
  const { category, pathway, condition, city, minQuantity, maxQuantity, sort, search, includeUnavailable } = req.query;
  const params = [];
  let sql = 'SELECT l.*, u.full_name AS owner_name, u.organization AS owner_organization FROM lots l JOIN users u ON u.id = l.owner_id';
  const filters = [includeUnavailable === 'true' ? "l.status IN ('available', 'reserved', 'completed')" : "l.status = 'available'"];
  for (const [column, value] of [['ingredient_category', category], ['category', pathway], ['product_condition', condition]]) {
    if (value) {
      params.push(value);
      filters.push(`${column} = $${params.length}`);
    }
  }
  if (city) { params.push(`%${city}%`); filters.push(`l.location_city ILIKE $${params.length}`); }
  if (minQuantity) { params.push(Number(minQuantity)); filters.push(`l.quantity_kg >= $${params.length}`); }
  if (maxQuantity) { params.push(Number(maxQuantity)); filters.push(`l.quantity_kg <= $${params.length}`); }
  if (search) { params.push(`%${search}%`); filters.push(`(l.title ILIKE $${params.length} OR COALESCE(l.description, '') ILIKE $${params.length})`); }
  sql += ' WHERE ' + filters.join(' AND ');
  sql += sort === 'pickup' ? ' ORDER BY l.pickup_at ASC NULLS LAST, l.created_at DESC' : ' ORDER BY l.created_at DESC';
  const result = await query(sql, params);
  return res.json({ lots: result.rows });
});

router.get('/reservations/mine', requireAuth, async (req, res) => {
  const result = await query(
    'SELECT r.id AS reservation_id, r.created_at AS reserved_at, l.*, u.full_name AS owner_name, u.organization AS owner_organization FROM reservations r JOIN lots l ON l.id = r.lot_id JOIN users u ON u.id = l.owner_id WHERE r.reserver_id = $1 ORDER BY r.created_at DESC',
    [req.user.id]
  );
  return res.json({ reservations: result.rows });
});

router.get('/mine', requireAuth, async (req, res) => {
  if (req.user.role !== 'emitter') {
    return res.status(403).json({ error: 'Only emitters can view published lots.' });
  }
  const result = await query(
    'SELECT l.*, u.full_name AS owner_name, u.organization AS owner_organization FROM lots l JOIN users u ON u.id = l.owner_id WHERE l.owner_id = $1 ORDER BY l.created_at DESC',
    [req.user.id]
  );
  return res.json({ lots: result.rows });
});

router.get('/transfers/mine', requireAuth, async (req, res) => {
  const isEmitter = req.user.role === 'emitter';
  const result = await query(
    `SELECT r.id AS reservation_id, ${isEmitter ? 'NULL' : 'r.pickup_pin'} AS pickup_pin, r.transfer_status, r.completed_at, r.created_at AS reserved_at,
      l.*, owner.full_name AS owner_name, owner.organization AS owner_organization,
      receiver.full_name AS receiver_name, receiver.organization AS receiver_organization,
      receiver.email AS receiver_email, receiver.phone AS receiver_phone
     FROM reservations r JOIN lots l ON l.id = r.lot_id
     JOIN users owner ON owner.id = l.owner_id
     JOIN users receiver ON receiver.id = r.reserver_id
     WHERE ${isEmitter ? 'l.owner_id' : 'r.reserver_id'} = $1
     ORDER BY r.created_at DESC`,
    [req.user.id]
  );
  return res.json({ transfers: result.rows });
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
  if (req.user.role !== 'emitter') {
    return res.status(403).json({ error: 'Only emitters can declare lots.' });
  }
  const { title, category, ingredientCategory, productCondition, quantityKg, locationCity, locationCountry, expiryStatus, pickupAt, pickupAddress, description, imageUrl } = req.body;
  const quantityUnit = req.body.quantityUnit || 'kg';
  if (!title || !locationCity || !pickupAt || !pickupAddress || !Number(quantityKg) || !['kg', 'tonnes', 'bags', 'cartons', 'litres', 'drums'].includes(quantityUnit)) {
    return res.status(400).json({ error: 'Product, quantity, pickup time, address, and city are required.' });
  }
  const suggestedPathway = productCondition === 'expired' || ingredientCategory === 'oils_fats'
    ? 'industrial_recycling'
    : ['damaged_packaging', 'out_of_human_use'].includes(productCondition)
      ? 'animal_feed'
      : category || 'human_donation';
  const canonicalKg = quantityUnit === 'tonnes' ? Number(quantityKg) * 1000 : quantityUnit === 'kg' ? Number(quantityKg) : 0;
  const created = await query(
    'INSERT INTO lots (owner_id, title, category, ingredient_category, product_condition, quantity_kg, quantity_value, quantity_unit, location_city, location_country, expiry_status, pickup_at, pickup_address, description, image_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *',
    [req.user.id, title, suggestedPathway, ingredientCategory || 'grains_flour', productCondition || 'intact', canonicalKg, Number(quantityKg), quantityUnit || 'kg', locationCity, locationCountry || 'Tunisia', expiryStatus || 'fresh', pickupAt, pickupAddress, description || null, imageUrl || null]
  );
  return res.status(201).json({ lot: created.rows[0] });
});

router.post('/:id/reserve', requireAuth, async (req, res) => {
  if (req.user.role !== 'receiver') {
    return res.status(403).json({ error: 'Only receivers can reserve lots.' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const lotResult = await client.query('SELECT * FROM lots WHERE id = $1 FOR UPDATE', [req.params.id]);
    if (!lotResult.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Lot not found.' });
    }
    const lot = lotResult.rows[0];
    if (Number(lot.owner_id) === Number(req.user.id)) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'You cannot reserve a lot you published.' });
    }
    if (lot.status !== 'available') {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'This lot is no longer available.' });
    }
    await client.query('INSERT INTO reservations (lot_id, reserver_id, message, pickup_pin) VALUES ($1,$2,$3,$4)', [lot.id, req.user.id, req.body.message || null, String(Math.floor(Math.random() * 10000)).padStart(4, '0')]);
    await client.query('UPDATE lots SET status = $1 WHERE id = $2', ['reserved', lot.id]);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(409).json({ error: 'You already reserved this lot.' });
  } finally {
    client.release();
  }
  return res.status(201).json({ ok: true, status: 'reserved' });
});

router.post('/transfers/:id/complete', requireAuth, async (req, res) => {
  if (req.user.role !== 'emitter') {
    return res.status(403).json({ error: 'Only emitters can confirm a hand-off.' });
  }
  const reservation = await query(
    'SELECT r.id, r.lot_id, r.pickup_pin, r.transfer_status FROM reservations r JOIN lots l ON l.id = r.lot_id WHERE r.id = $1 AND l.owner_id = $2',
    [req.params.id, req.user.id]
  );
  if (!reservation.rows.length) return res.status(404).json({ error: 'Transfer not found.' });
  const transfer = reservation.rows[0];
  if (transfer.transfer_status === 'completed') return res.status(409).json({ error: 'This transfer is already complete.' });
  if (String(req.body.pin || '') !== String(transfer.pickup_pin).trim()) return res.status(400).json({ error: 'Pickup PIN does not match.' });
  await query('UPDATE reservations SET transfer_status = $1, completed_at = now() WHERE id = $2', ['completed', transfer.id]);
  await query('UPDATE lots SET status = $1 WHERE id = $2', ['completed', transfer.lot_id]);
  return res.json({ ok: true, status: 'completed' });
});

export default router;
