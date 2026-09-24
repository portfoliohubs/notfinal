CREATE TABLE IF NOT EXISTS media_assets (
  file_id TEXT PRIMARY KEY,
  uid TEXT NOT NULL,
  case_id TEXT,
  metadata_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);
