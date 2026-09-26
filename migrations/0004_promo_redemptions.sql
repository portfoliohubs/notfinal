CREATE TABLE IF NOT EXISTS promo_redemptions (
  code TEXT NOT NULL,
  uid TEXT NOT NULL,
  redeemed_at TEXT NOT NULL,
  PRIMARY KEY (code, uid)
);
