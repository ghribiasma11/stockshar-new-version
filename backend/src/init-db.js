import bcrypt from 'bcryptjs';
import { pool, query, runSchema } from './db.js';

async function seed() {
  const existing = await query('SELECT COUNT(*)::int AS count FROM lots');
  if (existing.rows[0].count > 0) {
    console.log('Seed skipped: lots already present.');
    return;
  }

  const hash = await bcrypt.hash('password123', 10);

  const owner = await query(
    'INSERT INTO users (email, password_hash, full_name, organization, city, role, accepted_terms) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id',
    ['emitter@stockshare.demo', hash, 'Green Market Tunis', 'Green Market', 'Tunis', 'emitter', true]
  );
  const receiver = await query(
    'INSERT INTO users (email, password_hash, full_name, city, role, accepted_terms) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
    ['receiver@stockshare.demo', hash, 'Hope Kitchen', 'Tunis', 'receiver', true]
  );

  await query(
    'INSERT INTO lots (owner_id, title, category, description, quantity_kg, location_city, location_country, expiry_status, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
    [owner.rows[0].id, 'Golden orchard apples', 'human_donation', 'Fresh apples from a cancelled catering order, in perfect condition.', 120, 'Tunis', 'Tunisia', 'near_expiry', 'available']
  );
  await query(
    'INSERT INTO lots (owner_id, title, category, description, quantity_kg, location_city, location_country, expiry_status, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
    [owner.rows[0].id, 'Bread loaves surplus', 'animal_feed', 'Day-old bread loaves suitable for animal feed.', 60, 'Tunis', 'Tunisia', 'near_expiry', 'available']
  );
  await query(
    'INSERT INTO lots (owner_id, title, category, description, quantity_kg, location_city, location_country, expiry_status, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
    [receiver.rows[0].id, 'Mixed vegetables crate', 'human_donation', 'Assorted vegetables, good for community kitchens.', 45, 'Sfax', 'Tunisia', 'fresh', 'available']
  );

  console.log('Seed complete.');
}

async function main() {
  await runSchema();
  await seed();
  await pool.end();
  console.log('Database initialized.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
