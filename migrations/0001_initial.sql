CREATE TABLE IF NOT EXISTS users (
  uid TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  data_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS portfolios (
  uid TEXT PRIMARY KEY,
  data_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (uid) REFERENCES users(uid)
);

CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY,
  uid TEXT NOT NULL,
  data_json TEXT NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (uid) REFERENCES users(uid)
);

CREATE TABLE IF NOT EXISTS published_portfolios (
  uid TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  data_json TEXT NOT NULL DEFAULT '{}',
  published_at TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS slugs (
  slug TEXT PRIMARY KEY,
  uid TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS promo_codes (
  code TEXT PRIMARY KEY,
  data_json TEXT NOT NULL DEFAULT '{}',
  redeemed_count INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  data_json TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS blog_articles (
  slug TEXT PRIMARY KEY,
  data_json TEXT NOT NULL DEFAULT '{}',
  published_at TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admins (
  email TEXT PRIMARY KEY,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS media_assets (
  file_id TEXT PRIMARY KEY,
  uid TEXT NOT NULL,
  case_id TEXT,
  metadata_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);
