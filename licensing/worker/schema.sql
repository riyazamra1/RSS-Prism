PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS licenses (
  id TEXT PRIMARY KEY,
  license_key_hash TEXT NOT NULL UNIQUE,
  customer_email_hash TEXT NOT NULL,
  product_id TEXT NOT NULL CHECK (product_id = 'rss-prism-premium'),
  license_tier TEXT NOT NULL CHECK (license_tier IN ('single_site', 'five_site')),
  activation_limit INTEGER NOT NULL CHECK (activation_limit IN (1, 5)),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked')),
  starts_at TEXT NOT NULL,
  expires_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK ((license_tier = 'single_site' AND activation_limit = 1) OR
         (license_tier = 'five_site' AND activation_limit = 5))
);
CREATE INDEX IF NOT EXISTS licenses_email_product_idx ON licenses (customer_email_hash, product_id);

CREATE TABLE IF NOT EXISTS activations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  license_id TEXT NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
  site_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  UNIQUE (license_id, site_hash)
);
CREATE INDEX IF NOT EXISTS activations_license_idx ON activations (license_id);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_email_hash TEXT NOT NULL,
  customer_email TEXT,
  product_id TEXT NOT NULL CHECK (product_id = 'rss-prism-premium'),
  license_tier TEXT NOT NULL CHECK (license_tier IN ('single_site', 'five_site')),
  billing_interval TEXT NOT NULL CHECK (billing_interval = 'annual'),
  activation_limit INTEGER NOT NULL CHECK (activation_limit IN (1, 5)),
  amount_minor INTEGER NOT NULL CHECK (amount_minor >= 0),
  currency TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  provider TEXT,
  provider_session_id TEXT UNIQUE,
  provider_payment_id TEXT UNIQUE,
  terms_version TEXT NOT NULL,
  created_at TEXT NOT NULL,
  paid_at TEXT,
  CHECK ((license_tier = 'single_site' AND activation_limit = 1) OR
         (license_tier = 'five_site' AND activation_limit = 5))
);
CREATE TABLE IF NOT EXISTS payment_webhook_events (
  provider TEXT NOT NULL,
  event_id TEXT NOT NULL,
  received_at TEXT NOT NULL,
  processed_at TEXT,
  processing_status TEXT NOT NULL DEFAULT 'received' CHECK (processing_status IN ('received', 'processed', 'failed')),
  PRIMARY KEY (provider, event_id)
);

-- No public endpoint may create a license. Issue only after verified payment or authenticated operator action.