CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  organization TEXT,
  phone TEXT,
  city TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'receiver',
  account_status TEXT NOT NULL DEFAULT 'active',
  accepted_terms BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lots (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'human_donation',
  description TEXT,
  quantity_kg NUMERIC NOT NULL DEFAULT 0,
  quantity_value NUMERIC,
  location_city TEXT NOT NULL,
  location_country TEXT NOT NULL DEFAULT 'Tunisia',
  expiry_status TEXT NOT NULL DEFAULT 'near_expiry',
  status TEXT NOT NULL DEFAULT 'available',
  image_url TEXT,
  ingredient_category TEXT,
  product_condition TEXT NOT NULL DEFAULT 'intact',
  quantity_unit TEXT NOT NULL DEFAULT 'kg',
  pickup_at TIMESTAMPTZ,
  pickup_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE lots ADD COLUMN IF NOT EXISTS ingredient_category TEXT;
ALTER TABLE lots ADD COLUMN IF NOT EXISTS product_condition TEXT NOT NULL DEFAULT 'intact';
ALTER TABLE lots ADD COLUMN IF NOT EXISTS quantity_unit TEXT NOT NULL DEFAULT 'kg';
ALTER TABLE lots ADD COLUMN IF NOT EXISTS quantity_value NUMERIC;
UPDATE lots SET quantity_value = quantity_kg WHERE quantity_value IS NULL;
ALTER TABLE lots ADD COLUMN IF NOT EXISTS pickup_at TIMESTAMPTZ;
ALTER TABLE lots ADD COLUMN IF NOT EXISTS pickup_address TEXT;

CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  lot_id INTEGER NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
  reserver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT,
  pickup_pin CHAR(4),
  transfer_status TEXT NOT NULL DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (lot_id, reserver_id)
);

ALTER TABLE reservations ADD COLUMN IF NOT EXISTS pickup_pin CHAR(4);
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS transfer_status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
UPDATE reservations SET pickup_pin = lpad(floor(random() * 10000)::text, 4, '0') WHERE pickup_pin IS NULL;
ALTER TABLE reservations ALTER COLUMN pickup_pin SET NOT NULL;

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
