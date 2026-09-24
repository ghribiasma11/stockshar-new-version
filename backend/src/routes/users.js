import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'avatar-' + req.user.id + '-' + Date.now() + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed.'));
    }
    return cb(null, true);
  }
});

router.put('/me', requireAuth, async (req, res) => {
  const { fullName, organization, phone, city } = req.body;
  const updated = await query(
    'UPDATE users SET full_name = COALESCE($1, full_name), organization = $2, phone = $3, city = $4, updated_at = now() WHERE id = $5 RETURNING id, email, full_name, role, account_status, avatar_url, organization, city, phone',
    [fullName || null, organization || null, phone || null, city || null, req.user.id]
  );
  return res.json({ user: updated.rows[0] });
});

router.post('/me/photo', requireAuth, upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image provided.' });
  }
  const url = '/uploads/' + req.file.filename;
  const updated = await query('UPDATE users SET avatar_url = $1, updated_at = now() WHERE id = $2 RETURNING avatar_url', [url, req.user.id]);
  return res.json({ avatar_url: updated.rows[0].avatar_url });
});

router.post('/me/deactivate', requireAuth, async (req, res) => {
  await query('UPDATE users SET account_status = $1, updated_at = now() WHERE id = $2', ['deactivated', req.user.id]);
  return res.json({ ok: true, account_status: 'deactivated' });
});

router.post('/me/reactivate', requireAuth, async (req, res) => {
  await query('UPDATE users SET account_status = $1, updated_at = now() WHERE id = $2', ['active', req.user.id]);
  return res.json({ ok: true, account_status: 'active' });
});

router.delete('/me', requireAuth, async (req, res) => {
  await query('DELETE FROM users WHERE id = $1', [req.user.id]);
  return res.json({ ok: true });
});

export default router;
