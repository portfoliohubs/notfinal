import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { createServer, type Server } from 'node:http';
import { after, before, test } from 'node:test';
import { exportJWK, SignJWT } from 'jose';

const projectId = 'portfoliohubs-update';
const keyId = 'portfoliohubs-api-test-key';
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const publicJwk = { ...(await exportJWK(publicKey)), kid: keyId, use: 'sig', alg: 'RS256' };
const jwksServer = createServer((_request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' });
  response.end(JSON.stringify({ keys: [publicJwk] }));
});
await new Promise<void>((resolve) => jwksServer.listen(0, '127.0.0.1', resolve));
const jwksAddress = jwksServer.address();
if (!jwksAddress || typeof jwksAddress === 'string') throw new Error('Could not start test JWKS server.');

process.env.FIREBASE_PROJECT_ID = projectId;
process.env.FIREBASE_JWKS_URL = `http://127.0.0.1:${jwksAddress.port}/.well-known/jwks.json`;
process.env.BASE_URL = 'https://portfoliohubs.github.io';

const { app } = await import('../server.ts');
let apiServer: Server;
let baseUrl = '';

before(async () => {
  await new Promise<void>((resolve) => {
    apiServer = app.listen(0, '127.0.0.1', resolve);
  });
  const address = apiServer.address();
  if (!address || typeof address === 'string') throw new Error('Could not start test API server.');
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve) => apiServer.close(() => resolve()));
  await new Promise<void>((resolve) => jwksServer.close(() => resolve()));
});

async function issueToken(email: string, uid: string, emailVerified = true) {
  return new SignJWT({ email, email_verified: emailVerified })
    .setProtectedHeader({ alg: 'RS256', kid: keyId, typ: 'JWT' })
    .setIssuer(`https://securetoken.google.com/${projectId}`)
    .setAudience(projectId)
    .setSubject(uid)
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(privateKey);
}

async function post(path: string, token?: string, body?: unknown) {
  const headers = new Headers();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (body !== undefined) headers.set('Content-Type', 'application/json');
  return fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}

test('admin endpoints reject missing and malformed credentials', async () => {
  const missing = await post('/api/admin/generate-doctor-html', undefined, { doctor: { fullName: 'Test' } });
  assert.equal(missing.status, 401);

  const malformed = await post('/api/notify-indexnow', 'not-a-jwt', { urls: [] });
  assert.equal(malformed.status, 401);
});

test('admin endpoints reject unverified and non-allowlisted Firebase identities', async () => {
  const unverified = await issueToken('admin@portfoliohubs.com', 'unverified-admin', false);
  const unverifiedResponse = await post('/api/notify-indexnow', unverified, { urls: [] });
  assert.equal(unverifiedResponse.status, 403);

  const unlisted = await issueToken('doctor@portfoliohubs.com', 'unlisted-admin');
  const unlistedResponse = await post('/api/notify-indexnow', unlisted, { urls: [] });
  assert.equal(unlistedResponse.status, 403);
});

test('a verified static admin reaches route validation and external IndexNow URLs are rejected', async () => {
  const admin = await issueToken('admin@portfoliohubs.com', 'static-admin');
  const invalidPayload = await post('/api/admin/generate-doctor-html', admin);
  assert.equal(invalidPayload.status, 400);

  const externalUrl = await post('/api/notify-indexnow', admin, { urls: ['https://attacker.example/path'] });
  assert.equal(externalUrl.status, 400);
});

test('admin endpoints return 429 after 20 requests per route and user per minute', async () => {
  const admin = await issueToken('admin@portfoliohubs.com', 'rate-limit-admin');
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const response = await post('/api/notify-indexnow', admin, { urls: [] });
    assert.equal(response.status, 200, `request ${attempt + 1} should remain under the limit`);
  }

  const limited = await post('/api/notify-indexnow', admin, { urls: [] });
  assert.equal(limited.status, 429);
  assert.ok(limited.headers.get('Retry-After'));
});
