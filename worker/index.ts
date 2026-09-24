import { createRemoteJWKSet, jwtVerify } from 'jose';

interface D1Result<T = unknown> { results?: T[]; success?: boolean; meta?: unknown }
interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<D1Result>;
}
interface D1Database {
  prepare(query: string): D1Statement;
  batch(statements: D1Statement[]): Promise<D1Result[]>;
}
interface Env {
  DB?: D1Database;
  MEDIA?: unknown;
  FIREBASE_PROJECT_ID: string;
  IMAGEKIT_URL_ENDPOINT: string;
  IMAGEKIT_PUBLIC_KEY: string;
  IMAGEKIT_PRIVATE_KEY: string;
  ADMIN_EMAILS?: string;
}
interface User { uid: string; email: string }
interface AuthenticatedUser extends User { admin: boolean }
function imageKitPrivateKey(env: Env) {
  const raw = env.IMAGEKIT_PRIVATE_KEY || '';
  return raw.trim().replace(/^(['"])(.*)\1$/, '$2').trim();
}

const firebaseKeys = createRemoteJWKSet(new URL(
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com',
));
const STATIC_ADMINS = new Set([
  'cources01@gmail.com',
  'admin@portfoliohubs.com',
  'portfoliohubs.contact@gmail.com',
]);

function json(body: unknown, status = 200, request?: Request) {
  const origin = request?.headers.get('Origin');
  const headers = new Headers({ 'Cache-Control': 'no-store', 'Content-Type': 'application/json' });
  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    headers.set('Vary', 'Origin');
  }
  return new Response(JSON.stringify(body), { status, headers });
}
function error(message: string, status: number, request?: Request) { return json({ error: message }, status, request); }
function now() { return new Date().toISOString(); }
function parseJson(value: unknown): Record<string, unknown> {
  if (typeof value !== 'string' || !value) return {};
  try { const parsed = JSON.parse(value); return parsed && typeof parsed === 'object' ? parsed : {}; } catch { return {}; }
}
async function body(request: Request) {
  try {
    const value = await request.json();
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error();
    return value as Record<string, unknown>;
  } catch { throw new Response('invalid body', { status: 400 }); }
}
function requireDb(env: Env): D1Database {
  if (!env.DB) throw new Response('database unavailable', { status: 503 });
  return env.DB;
}

async function authenticate(request: Request, env: Env): Promise<User> {
  const header = request.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) throw new Response('authentication required', { status: 401 });
  const token = header.slice(7).trim();
  if (!token) throw new Response('authentication required', { status: 401 });
  try {
    const { payload } = await jwtVerify(token, firebaseKeys, {
      issuer: `https://securetoken.google.com/${env.FIREBASE_PROJECT_ID}`,
      audience: env.FIREBASE_PROJECT_ID,
    });
    if (typeof payload.sub !== 'string' || !payload.sub) throw new Error('subject missing');
    return { uid: payload.sub, email: typeof payload.email === 'string' ? payload.email.toLowerCase() : '' };
  } catch (caught) {
    const reason = caught instanceof Error && 'code' in caught
      ? String((caught as Error & { code?: unknown }).code || caught.name)
      : caught instanceof Error ? caught.name : 'verification_failed';
    throw new Response(`invalid authentication token (${reason})`, { status: 401 });
  }
}
async function getUser(request: Request, env: Env): Promise<AuthenticatedUser> {
  const user = await authenticate(request, env);
  const configured = (env.ADMIN_EMAILS || '').split(',').map((v) => v.trim().toLowerCase()).filter(Boolean);
  let admin = STATIC_ADMINS.has(user.email) || configured.includes(user.email) ||
    user.email.endsWith('@portfoliohubs.com');
  if (!admin && env.DB && user.email) {
    const row = await env.DB.prepare('SELECT email FROM admins WHERE lower(email) = lower(?)').bind(user.email).first();
    admin = Boolean(row);
  }
  return { ...user, admin };
}
async function targetUid(request: Request, env: Env, user: AuthenticatedUser) {
  const requested = new URL(request.url).searchParams.get('uid');
  if (requested && requested !== user.uid && !user.admin) throw new Response('forbidden', { status: 403 });
  return requested || user.uid;
}
function slug(value: unknown) {
  return typeof value === 'string' && /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/.test(value) ? value : null;
}
async function mediaAuth(request: Request, env: Env) {
  const user = await getUser(request, env);
  const privateKey = imageKitPrivateKey(env);
  if (!privateKey) return error('media authorization is not configured', 503, request);
  const expire = Math.floor(Date.now() / 1000) + 600;
  const token = crypto.randomUUID();
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(privateKey),
    { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
  const bytes = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${token}${expire}`)));
  const signature = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return json({ ...user, token, expire, signature, publicKey: env.IMAGEKIT_PUBLIC_KEY, urlEndpoint: env.IMAGEKIT_URL_ENDPOINT }, 200, request);
}
async function mediaComplete(request: Request, env: Env) {
  const user = await getUser(request, env);
  const value = await body(request);
  const fileId = typeof value.fileId === 'string' ? value.fileId : '';
  if (!fileId) return error('fileId is required', 400, request);
  const db = requireDb(env);
  await db.prepare(`INSERT INTO media_assets (file_id, uid, case_id, metadata_json, created_at)
    VALUES (?, ?, ?, ?, ?) ON CONFLICT(file_id) DO UPDATE SET metadata_json = excluded.metadata_json`)
    .bind(fileId, user.uid, typeof value.targetId === 'string' ? value.targetId : null, JSON.stringify(value), now()).run();
  return json({ ok: true, fileId }, 200, request);
}
async function mediaUpload(request: Request, env: Env) {
  const user = await getUser(request, env);
  const privateKey = imageKitPrivateKey(env);
  if (!privateKey) return error('media upload is not configured', 503, request);
  const incoming = await request.formData();
  const file = incoming.get('file');
  const fileName = incoming.get('fileName');
  const folder = incoming.get('folder');
  if (!(file instanceof File) || typeof fileName !== 'string' || !fileName) {
    return error('file and fileName are required', 400, request);
  }
  const uploadForm = new FormData();
  uploadForm.append('file', file, file.name || fileName);
  uploadForm.append('fileName', fileName);
  uploadForm.append('folder', typeof folder === 'string' && folder ? folder : `/portfoliohubs/${user.uid}`);
  uploadForm.append('useUniqueFileName', 'true');
  const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    headers: { Authorization: `Basic ${btoa(`${privateKey}:`)}` },
    body: uploadForm,
  });
  const text = await response.text();
  if (!response.ok) return error(`ImageKit upload failed (${response.status}): ${text}`, 502, request);
  try {
    return json(JSON.parse(text), 200, request);
  } catch {
    return error('ImageKit returned an invalid upload response', 502, request);
  }
}
async function mediaDiagnostics(request: Request, env: Env) {
  const user = await getUser(request, env);
  if (!user.admin) return error('admin access required', 403, request);
  const privateKey = imageKitPrivateKey(env);
  if (!privateKey) return error('IMAGEKIT_PRIVATE_KEY is empty', 503, request);
  const response = await fetch('https://api.imagekit.io/v1/files?limit=1', {
    headers: { Authorization: `Basic ${btoa(`${privateKey}:`)}` },
  });
  return json({
    ok: response.ok,
    status: response.status,
    requestId: response.headers.get('x-ik-requestId'),
    keyFormat: /^private_/.test(privateKey) ? 'private-prefix' : 'unexpected-prefix',
    keyLength: privateKey.length,
  }, 200, request);
}
async function deleteMediaForCase(env: Env, uid: string, caseId: string) {
  const privateKey = imageKitPrivateKey(env);
  if (!env.DB || !privateKey) return;
  const db = env.DB;
  const rows = (await db.prepare('SELECT file_id FROM media_assets WHERE uid = ? AND case_id = ?')
    .bind(uid, caseId).all<{ file_id: string }>()).results || [];
  const auth = `Basic ${btoa(`${privateKey}:`)}`;
  await Promise.all(rows.map(async (row) => {
    await fetch(`https://api.imagekit.io/v1/files/${encodeURIComponent(row.file_id)}`, {
      method: 'DELETE', headers: { Authorization: auth },
    });
  }));
  await db.prepare('DELETE FROM media_assets WHERE uid = ? AND case_id = ?').bind(uid, caseId).run();
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') {
      const origin = request.headers.get('Origin');
      const headers = new Headers();
      if (origin) {
        headers.set('Access-Control-Allow-Origin', origin);
        headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
        headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        headers.set('Access-Control-Max-Age', '86400');
        headers.set('Vary', 'Origin');
      }
      return new Response(null, { status: 204, headers });
    }
    if (request.method === 'GET' && url.pathname === '/api/health') {
      return json({ ok: true, service: 'portfoliohubs-api', firebaseAuthProject: env.FIREBASE_PROJECT_ID,
        d1Configured: Boolean(env.DB), r2Configured: Boolean(env.MEDIA) }, 200, request);
    }
    if (url.pathname === '/api/media/diagnostics' && request.method === 'GET') {
      const authorization = request.headers.get('Authorization') || '';
      if (!authorization.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'authentication required' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        });
      }
    }
    try {
      if (url.pathname === '/api/media/auth' && request.method === 'GET') return await mediaAuth(request, env);
      if (url.pathname === '/api/media/upload' && request.method === 'POST') return await mediaUpload(request, env);
      if (url.pathname === '/api/media/diagnostics' && request.method === 'GET') return await mediaDiagnostics(request, env);
      if (url.pathname === '/api/media/complete' && request.method === 'POST') return await mediaComplete(request, env);
      const publicWebsite = url.pathname.match(/^\/api\/(?:website|public)\/([^/]+)$/);
      if (publicWebsite && request.method === 'GET') {
        const db = requireDb(env); const found = await db.prepare(
          'SELECT uid, slug, data_json, published_at, updated_at FROM published_portfolios WHERE slug = ?',
        ).bind(publicWebsite[1]).first<Record<string, unknown>>();
        return found ? json({ ...found, data: parseJson(found.data_json) }, 200, request) : error('website not found', 404, request);
      }
      // Blog and settings are public read surfaces; writes remain admin-only below.
      if (request.method === 'GET' && (url.pathname === '/api/blog' || url.pathname.startsWith('/api/blog/'))) {
        const db = requireDb(env); const articleSlug = url.pathname.slice('/api/blog/'.length);
        if (articleSlug) {
          const row = await db.prepare('SELECT slug, data_json, published_at, updated_at FROM blog_articles WHERE slug = ?').bind(articleSlug).first<Record<string, unknown>>();
          return row ? json({ ...row, data: parseJson(row.data_json) }, 200, request) : error('article not found', 404, request);
        }
        const rows = (await db.prepare('SELECT slug, data_json, published_at, updated_at FROM blog_articles ORDER BY published_at DESC').all<Record<string, unknown>>()).results || [];
        return json(rows.map((row) => ({ ...row, data: parseJson(row.data_json) })), 200, request);
      }
      if (request.method === 'GET' && (url.pathname === '/api/settings' || url.pathname.startsWith('/api/settings/'))) {
        const key = url.pathname.slice('/api/settings/'.length) || (url.searchParams.get('key') || '');
        if (!key) return error('setting key is required', 400, request);
        const row = await requireDb(env).prepare('SELECT key, data_json, updated_at FROM settings WHERE key = ?').bind(key).first<Record<string, unknown>>();
        return row ? json({ ...row, data: parseJson(row.data_json) }, 200, request) : error('setting not found', 404, request);
      }
      const user = await getUser(request, env);
      const db = requireDb(env);
      const uid = await targetUid(request, env, user);

      if (url.pathname === '/api/admin/doctors' && request.method === 'GET') {
        if (!user.admin) return error('admin access required', 403, request);
        const users = (await db.prepare(
          'SELECT uid, data_json, created_at, updated_at FROM users ORDER BY updated_at DESC',
        ).all<Record<string, unknown>>()).results || [];
        const doctors = await Promise.all(users.map(async (row) => {
          const cases = (await db.prepare(
            'SELECT id, data_json, sort_order, created_at, updated_at FROM cases WHERE uid = ? ORDER BY sort_order, created_at',
          ).bind(row.uid).all<Record<string, unknown>>()).results || [];
          return {
            ...(parseJson(row.data_json)),
            id: row.uid,
            uid: row.uid,
            caseCount: cases.length,
            cases: cases.map((item) => ({
              ...parseJson(item.data_json),
              id: item.id,
              sortOrder: item.sort_order,
              createdAt: item.created_at,
              updatedAt: item.updated_at,
            })),
            createdAt: (parseJson(row.data_json).createdAt as string | undefined) || row.created_at,
            updatedAt: row.updated_at,
          };
        }));
        return json(doctors, 200, request);
      }

      if (url.pathname === '/api/profile') {
        if (request.method === 'GET') {
          const row = await db.prepare('SELECT uid, data_json, created_at, updated_at FROM users WHERE uid = ?').bind(uid).first<Record<string, unknown>>();
          return row ? json({ ...row, data: parseJson(row.data_json) }, 200, request) : error('profile not found', 404, request);
        }
        if (['PUT', 'PATCH'].includes(request.method)) {
          const value = await body(request); const stamp = now();
          const existing = await db.prepare('SELECT data_json, email FROM users WHERE uid = ?').bind(uid).first<{ data_json?: string; email?: string }>();
          const existingData = parseJson(existing?.data_json);
          const merged = { ...existingData, ...value };
          const userEmail = (typeof value.email === 'string' && value.email) ? value.email : (existing?.email || user.email);
          await db.prepare(`INSERT INTO users (uid, email, data_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(uid) DO UPDATE SET email = excluded.email, data_json = excluded.data_json, updated_at = excluded.updated_at`)
            .bind(uid, userEmail, JSON.stringify(merged), stamp, stamp).run();
          return json({ ok: true, uid, data: merged }, 200, request);
        }
      }
      if (url.pathname === '/api/portfolio') {
        if (request.method === 'GET') {
          const row = await db.prepare('SELECT uid, data_json, created_at, updated_at FROM portfolios WHERE uid = ?').bind(uid).first<Record<string, unknown>>();
          return row ? json({ ...row, data: parseJson(row.data_json) }, 200, request) : error('portfolio not found', 404, request);
        }
        if (['PUT', 'PATCH'].includes(request.method)) {
          const value = await body(request); const stamp = now();
          const existing = await db.prepare('SELECT data_json FROM portfolios WHERE uid = ?').bind(uid).first<{ data_json?: string }>();
          const existingData = parseJson(existing?.data_json);
          const merged = { ...existingData, ...value };
          await db.prepare(`INSERT INTO portfolios (uid, data_json, created_at, updated_at) VALUES (?, ?, ?, ?)
            ON CONFLICT(uid) DO UPDATE SET data_json = excluded.data_json, updated_at = excluded.updated_at`)
            .bind(uid, JSON.stringify(merged), stamp, stamp).run();
          return json({ ok: true, uid, data: merged }, 200, request);
        }
      }
      if (url.pathname === '/api/cases/reorder' && request.method === 'POST') {
        const value = await body(request);
        const ids = Array.isArray(value.ids) ? value.ids.filter((id): id is string => typeof id === 'string') : [];
        if (!ids.length || ids.length > 500) return error('case ids are required', 400, request);
        const stamp = now();
        await db.batch(ids.map((id, index) => db.prepare(
          'UPDATE cases SET sort_order = ?, updated_at = ? WHERE id = ? AND uid = ?',
        ).bind(index, stamp, id, uid)));
        return json({ ok: true }, 200, request);
      }
      const caseMatch = url.pathname.match(/^\/api\/cases(?:\/([^/]+))?$/);
      if (caseMatch) {
        const caseId = caseMatch[1];
        if (request.method === 'GET') {
          const query = caseId ? 'SELECT * FROM cases WHERE uid = ? AND id = ?' : 'SELECT * FROM cases WHERE uid = ? ORDER BY sort_order, created_at';
          const statement = db.prepare(query).bind(...(caseId ? [uid, caseId] : [uid]));
          if (caseId) {
            const row = await statement.first<Record<string, unknown>>();
            return row ? json({ ...row, data: parseJson(row.data_json) }, 200, request) : error('case not found', 404, request);
          }
          const rows = (await statement.all<Record<string, unknown>>()).results || [];
          return json(rows.map((row) => ({ ...row, data: parseJson(row.data_json) })), 200, request);
        }
        if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
          const value = await body(request); const id = caseId || (typeof value.id === 'string' ? value.id : crypto.randomUUID());
          if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) return error('invalid case id', 400, request);
          const owner = await db.prepare('SELECT uid FROM cases WHERE id = ?').bind(id).first<{ uid: string }>();
          if (owner && owner.uid !== uid) return error('forbidden', 403, request);
          const stamp = now(); const order = typeof value.sortOrder === 'number' ? value.sortOrder : 0;
          await db.prepare(`INSERT INTO cases (id, uid, data_json, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET data_json = excluded.data_json, sort_order = excluded.sort_order, updated_at = excluded.updated_at`)
            .bind(id, uid, JSON.stringify(value), order, stamp, stamp).run();
          await db.prepare(`UPDATE users SET data_json = json_set(COALESCE(data_json, '{}'), '$.caseCount',
            (SELECT COUNT(*) FROM cases WHERE uid = ?)), updated_at = ? WHERE uid = ?`)
            .bind(uid, stamp, uid).run();
          return json({ ok: true, id, uid, data: value }, 200, request);
        }
        if (request.method === 'DELETE' && caseId) {
          await deleteMediaForCase(env, uid, caseId);
          await db.prepare('DELETE FROM cases WHERE id = ? AND uid = ?').bind(caseId, uid).run();
          await db.prepare(`UPDATE users SET data_json = json_set(COALESCE(data_json, '{}'), '$.caseCount',
            (SELECT COUNT(*) FROM cases WHERE uid = ?)), updated_at = ? WHERE uid = ?`)
            .bind(uid, now(), uid).run();
          return json({ ok: true }, 200, request);
        }
      }
      if (url.pathname === '/api/publish' && (request.method === 'POST' || request.method === 'PUT')) {
        const value = await body(request); const chosen = slug(value.slug);
        if (!chosen) return error('slug must contain lowercase letters, numbers, and hyphens', 400, request);
        const existing = await db.prepare('SELECT uid FROM slugs WHERE slug = ?').bind(chosen).first<{ uid: string }>();
        if (existing && existing.uid !== uid && !user.admin) return error('slug is already in use', 409, request);
        const oldSlug = await db.prepare('SELECT slug FROM published_portfolios WHERE uid = ?').bind(uid).first<{ slug: string }>();
        const profile = await db.prepare('SELECT data_json FROM users WHERE uid = ?').bind(uid).first<{ data_json: string }>();
        const portfolio = await db.prepare('SELECT data_json FROM portfolios WHERE uid = ?').bind(uid).first<{ data_json: string }>();
        const cases = (await db.prepare('SELECT id, data_json, sort_order FROM cases WHERE uid = ? ORDER BY sort_order, created_at').bind(uid).all()).results || [];
        const published = { ...parseJson(profile?.data_json), ...parseJson(portfolio?.data_json), cases: cases.map((c) => ({ ...(c as any), data: parseJson((c as any).data_json) })) };
        const stamp = now();
        const statements = [
          ...(oldSlug && oldSlug.slug !== chosen ? [db.prepare('DELETE FROM slugs WHERE slug = ? AND uid = ?').bind(oldSlug.slug, uid)] : []),
          db.prepare(`INSERT INTO slugs (slug, uid, created_at) VALUES (?, ?, ?) ON CONFLICT(slug) DO UPDATE SET uid = ?`).bind(chosen, uid, stamp, uid),
          db.prepare(`INSERT INTO published_portfolios (uid, slug, data_json, published_at, updated_at) VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(uid) DO UPDATE SET slug = excluded.slug, data_json = excluded.data_json, published_at = excluded.published_at, updated_at = excluded.updated_at`)
            .bind(uid, chosen, JSON.stringify(published), stamp, stamp),
        ];
        await db.batch(statements);
        return json({ ok: true, uid, slug: chosen, publishedAt: stamp }, 200, request);
      }
      if (url.pathname === '/api/blog' || url.pathname.startsWith('/api/blog/')) {
        if (request.method === 'GET') {
          const articleSlug = url.pathname.slice('/api/blog/'.length);
          if (articleSlug) {
            const row = await db.prepare('SELECT slug, data_json, published_at, updated_at FROM blog_articles WHERE slug = ?').bind(articleSlug).first<Record<string, unknown>>();
            return row ? json({ ...row, data: parseJson(row.data_json) }, 200, request) : error('article not found', 404, request);
          }
          const rows = (await db.prepare('SELECT slug, data_json, published_at, updated_at FROM blog_articles ORDER BY published_at DESC').all<Record<string, unknown>>()).results || [];
          return json(rows.map((row) => ({ ...row, data: parseJson(row.data_json) })), 200, request);
        }
        if (!user.admin) return error('admin access required', 403, request);
        const articleSlug = url.pathname.slice('/api/blog/'.length);
        if (request.method === 'DELETE' && articleSlug) { await db.prepare('DELETE FROM blog_articles WHERE slug = ?').bind(articleSlug).run(); return json({ ok: true }, 200, request); }
        if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
          const value = await body(request); const key = slug(value.slug || articleSlug);
          if (!key) return error('valid article slug is required', 400, request);
          const stamp = now(); await db.prepare(`INSERT INTO blog_articles (slug, data_json, published_at, updated_at) VALUES (?, ?, ?, ?)
            ON CONFLICT(slug) DO UPDATE SET data_json = excluded.data_json, published_at = excluded.published_at, updated_at = excluded.updated_at`)
            .bind(key, JSON.stringify(value), typeof value.publishedAt === 'string' ? value.publishedAt : stamp, stamp).run();
          return json({ ok: true, slug: key }, 200, request);
        }
      }
      if (url.pathname === '/api/settings' || url.pathname.startsWith('/api/settings/')) {
        const key = url.pathname.slice('/api/settings/'.length) || (url.searchParams.get('key') || '');
        if (request.method === 'GET') {
          const row = key ? await db.prepare('SELECT key, data_json, updated_at FROM settings WHERE key = ?').bind(key).first<Record<string, unknown>>()
            : null;
          return row ? json({ ...row, data: parseJson(row.data_json) }, 200, request) : error('setting not found', 404, request);
        }
        if (!user.admin) return error('admin access required', 403, request);
        if (request.method === 'DELETE' && key) { await db.prepare('DELETE FROM settings WHERE key = ?').bind(key).run(); return json({ ok: true }, 200, request); }
        if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
          const value = await body(request); const settingKey = key || (typeof value.key === 'string' ? value.key : '');
          if (!settingKey || !/^[A-Za-z0-9_.-]{1,128}$/.test(settingKey)) return error('valid setting key is required', 400, request);
          await db.prepare(`INSERT INTO settings (key, data_json, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET data_json = excluded.data_json, updated_at = excluded.updated_at`)
            .bind(settingKey, JSON.stringify(value), now()).run();
          return json({ ok: true, key: settingKey }, 200, request);
        }
      }
      if (url.pathname === '/api/promo' || url.pathname.startsWith('/api/promo/')) {
        let code = (url.pathname.slice('/api/promo/'.length) || url.searchParams.get('code') || '').toUpperCase();
        if (request.method === 'POST' && url.pathname === '/api/promo/redeem') {
          const redemption = await body(request);
          code = typeof redemption.code === 'string' ? redemption.code.toUpperCase() : '';
        }
        if (request.method === 'GET') {
          if (!code) {
            if (!user.admin) return error('admin access required', 403, request);
            const rows = (await db.prepare(
              'SELECT code, data_json, redeemed_count, updated_at FROM promo_codes ORDER BY code',
            ).all<Record<string, unknown>>()).results || [];
            return json(rows.map((row) => ({ ...row, data: parseJson(row.data_json) })), 200, request);
          }
          const row = await db.prepare('SELECT code, data_json, redeemed_count, updated_at FROM promo_codes WHERE code = ?').bind(code).first<Record<string, unknown>>();
          return row ? json({ ...row, data: parseJson(row.data_json) }, 200, request) : error('promo code not found', 404, request);
        }
        if (request.method === 'POST' && code && (url.pathname === '/api/promo/redeem' || url.pathname.startsWith('/api/promo/'))) {
          const result = await db.prepare('UPDATE promo_codes SET redeemed_count = redeemed_count + 1, updated_at = ? WHERE code = ? AND (json_extract(data_json, "$.maxRedemptions") IS NULL OR redeemed_count < json_extract(data_json, "$.maxRedemptions"))').bind(now(), code).run();
          if (!result.meta || (result.meta as any).changes !== 1) return error('promo code is invalid or exhausted', 400, request);
          return json({ ok: true, code }, 200, request);
        }
        if (!user.admin) return error('admin access required', 403, request);
        if (request.method === 'DELETE' && code) { await db.prepare('DELETE FROM promo_codes WHERE code = ?').bind(code).run(); return json({ ok: true }, 200, request); }
        if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
          const value = await body(request); const key = code || (typeof value.code === 'string' ? value.code.toUpperCase() : '');
          if (!/^[A-Z0-9_-]{2,64}$/.test(key)) return error('valid promo code is required', 400, request);
          await db.prepare(`INSERT INTO promo_codes (code, data_json, redeemed_count, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(code) DO UPDATE SET data_json = excluded.data_json, updated_at = excluded.updated_at`)
            .bind(key, JSON.stringify(value), typeof value.redeemedCount === 'number' ? value.redeemedCount : 0, now()).run();
          return json({ ok: true, code: key }, 200, request);
        }
      }
      return error('not found', 404, request);
    } catch (caught) {
      if (caught instanceof Response || (
        caught && typeof caught === 'object' &&
        typeof (caught as Response).status === 'number' &&
        typeof (caught as Response).text === 'function'
      )) {
        const response = caught as Response;
        return json({ error: await response.text() }, response.status, request);
      }
      console.error('[api]', caught);
      return error('internal server error', 500, request);
    }
  },
};
