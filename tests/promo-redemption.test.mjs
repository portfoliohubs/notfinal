import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';

const insertRedemptionSql = `INSERT OR IGNORE INTO promo_redemptions (code, uid, redeemed_at)
  SELECT ?, ?, ? WHERE EXISTS (
    SELECT 1 FROM promo_codes WHERE code = ? AND redeemed_count = ?
      AND json_extract(data_json, '$.active') = 1
      AND (json_extract(data_json, '$.maxRedemptions') IS NULL
        OR redeemed_count < json_extract(data_json, '$.maxRedemptions'))
  )`;
const incrementPromoSql = `UPDATE promo_codes SET redeemed_count = redeemed_count + 1, updated_at = ?
  WHERE code = ? AND redeemed_count = ? AND changes() = 1
    AND json_extract(data_json, '$.active') = 1
    AND (json_extract(data_json, '$.maxRedemptions') IS NULL
      OR redeemed_count < json_extract(data_json, '$.maxRedemptions'))`;
const grantLimitSql = `UPDATE users SET data_json = json_set(COALESCE(data_json, '{}'), '$.caseLimit',
  MAX(COALESCE(CAST(json_extract(data_json, '$.caseLimit') AS INTEGER), 3), ?),
  '$.promoCode', ?, '$.updatedAt', ?), updated_at = ?
  WHERE uid = ? AND changes() = 1
  AND EXISTS (SELECT 1 FROM promo_codes WHERE code = ? AND redeemed_count = ? AND updated_at = ?)`;

function createDatabase(maxRedemptions = 10) {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE users (uid TEXT PRIMARY KEY, data_json TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE promo_codes (code TEXT PRIMARY KEY, data_json TEXT NOT NULL, redeemed_count INTEGER NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE promo_redemptions (code TEXT NOT NULL, uid TEXT NOT NULL, redeemed_at TEXT NOT NULL, PRIMARY KEY (code, uid));
  `);
  db.prepare('INSERT INTO users VALUES (?, ?, ?)').run('alice', JSON.stringify({ caseLimit: 3 }), 'created');
  db.prepare('INSERT INTO users VALUES (?, ?, ?)').run('bob', JSON.stringify({ caseLimit: 3 }), 'created');
  db.prepare('INSERT INTO promo_codes VALUES (?, ?, ?, ?)')
    .run('SAVE', JSON.stringify({ active: true, caseLimit: 5, maxRedemptions }), 0, 'created');
  return db;
}

function redeem(db, uid, expectedCount, stamp) {
  db.exec('BEGIN');
  const redemption = db.prepare(insertRedemptionSql).run('SAVE', uid, stamp, 'SAVE', expectedCount);
  const counter = db.prepare(incrementPromoSql).run(stamp, 'SAVE', expectedCount);
  const profile = db.prepare(grantLimitSql).run(5, 'SAVE', stamp, stamp, uid, 'SAVE', expectedCount + 1, stamp);
  db.exec('COMMIT');
  return { redemptionChanges: redemption.changes, counterChanges: counter.changes, profileChanges: profile.changes };
}

test('a user can redeem the same promo code only once', () => {
  const db = createDatabase();
  assert.deepEqual(redeem(db, 'alice', 0, 'first'), {
    redemptionChanges: 1,
    counterChanges: 1,
    profileChanges: 1,
  });
  assert.deepEqual(redeem(db, 'alice', 1, 'second'), {
    redemptionChanges: 0,
    counterChanges: 0,
    profileChanges: 0,
  });
  assert.equal(db.prepare('SELECT redeemed_count FROM promo_codes WHERE code = ?').get('SAVE').redeemed_count, 1);
  assert.equal(JSON.parse(db.prepare('SELECT data_json FROM users WHERE uid = ?').get('alice').data_json).caseLimit, 5);
  db.close();
});

test('the global redemption limit is enforced for different users', () => {
  const db = createDatabase(1);
  assert.equal(redeem(db, 'alice', 0, 'first').profileChanges, 1);
  assert.deepEqual(redeem(db, 'bob', 1, 'second'), {
    redemptionChanges: 0,
    counterChanges: 0,
    profileChanges: 0,
  });
  assert.equal(db.prepare('SELECT redeemed_count FROM promo_codes WHERE code = ?').get('SAVE').redeemed_count, 1);
  assert.equal(JSON.parse(db.prepare('SELECT data_json FROM users WHERE uid = ?').get('bob').data_json).caseLimit, 3);
  db.close();
});
