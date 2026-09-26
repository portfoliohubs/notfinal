import express, { NextFunction, Request, Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { buildDoctorStaticHtml } from './scripts/doctor-template.mjs';
import { buildArticleStaticHtml } from './scripts/generate-static-pages.mjs';
import { submitIndexNowUrls } from './scripts/notify-indexnow.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';
const BASE_URL = process.env.BASE_URL || 'https://portfoliohubs.github.io';
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'portfoliohubs-update';
const firebaseKeys = createRemoteJWKSet(new URL(
  process.env.FIREBASE_JWKS_URL || 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com',
));
const STATIC_ADMINS = new Set([
  'cources01@gmail.com',
  'admin@portfoliohubs.com',
  'portfoliohubs.contact@gmail.com',
]);
const ADMIN_RATE_LIMIT = 20;
const ADMIN_RATE_WINDOW_MS = 60_000;
const adminRateLimits = new Map<string, { count: number; resetAt: number }>();

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
  if (!token) return res.status(401).json({ ok: false, error: 'Authentication required.' });

  try {
    const { payload } = await jwtVerify(token, firebaseKeys, {
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      audience: FIREBASE_PROJECT_ID,
    });
    const email = typeof payload.email === 'string' ? payload.email.toLowerCase() : '';
    if (payload.email_verified !== true || !STATIC_ADMINS.has(email)) {
      return res.status(403).json({ ok: false, error: 'Admin access required.' });
    }
    res.locals.adminUid = payload.sub;
    return next();
  } catch {
    return res.status(401).json({ ok: false, error: 'Invalid authentication token.' });
  }
}

function limitAdminRequests(req: Request, res: Response, next: NextFunction) {
  const now = Date.now();
  const key = `${String(res.locals.adminUid || 'unknown')}:${req.path}`;
  let entry = adminRateLimits.get(key);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + ADMIN_RATE_WINDOW_MS };
    adminRateLimits.set(key, entry);
  }
  if (adminRateLimits.size > 1000) {
    for (const [entryKey, value] of adminRateLimits) {
      if (value.resetAt <= now) adminRateLimits.delete(entryKey);
    }
  }
  if (entry.count >= ADMIN_RATE_LIMIT) {
    res.setHeader('Retry-After', String(Math.max(1, Math.ceil((entry.resetAt - now) / 1000))));
    return res.status(429).json({ ok: false, error: 'Too many admin requests. Try again later.' });
  }
  entry.count += 1;
  return next();
}

app.disable('x-powered-by');
app.use((_, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb', parameterLimit: 100 }));

// Helper: ensure directory
function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Helper: clean slug
function normalizeDoctorSlug(raw: string) {
  return String(raw || 'doctor')
    .trim()
    .toLowerCase()
    .replace(/^dr-?/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'doctor';
}

// -------------------------------------------------------------
// 1. API: Instant Static Generation for Approved Doctor
// -------------------------------------------------------------
app.post('/api/admin/generate-doctor-html', requireAdmin, limitAdminRequests, async (req: Request, res: Response) => {
  try {
    const doctor = req.body?.doctor;
    if (!doctor || typeof doctor !== 'object' || Array.isArray(doctor) ||
      ![doctor.fullName, doctor.fullNameAr].some((name) => typeof name === 'string' && name.trim())) {
      return res.status(400).json({ ok: false, error: 'Doctor data with fullName is required.' });
    }
    const doctorCases = Array.isArray(req.body?.cases) && req.body.cases.length > 0
      ? req.body.cases
      : Array.isArray(doctor.cases) ? doctor.cases : [];
    if (doctorCases.length > 100 || !doctorCases.every((item: unknown): item is Record<string, unknown> =>
      Boolean(item) && typeof item === 'object' && !Array.isArray(item))) {
      return res.status(400).json({ ok: false, error: 'Clinical cases must be a list of at most 100 objects.' });
    }

    const cleanSlug = normalizeDoctorSlug(doctor.slug || doctor.username || doctor.fullName);
    const drSlug = `dr${cleanSlug}`;
    const doctorObj = {
      ...doctor,
      slug: cleanSlug,
      username: cleanSlug
    };

    // 1. Generate full static HTML using doctor-template.mjs
    const doctorHtml = buildDoctorStaticHtml({
      doctor: doctorObj,
      cases: doctorCases,
      baseUrl: BASE_URL
    });

    const publicRoot = path.join(__dirname, 'public');
    const distRoot = path.join(__dirname, 'dist');

    // All possible directory permutations so every URL format resolves to real HTML
    const targetDirs = [
      path.join(publicRoot, 'dr', cleanSlug),
      path.join(publicRoot, 'dr', drSlug),
      path.join(publicRoot, drSlug),
      path.join(publicRoot, cleanSlug)
    ];

    if (fs.existsSync(distRoot)) {
      targetDirs.push(
        path.join(distRoot, 'dr', cleanSlug),
        path.join(distRoot, 'dr', drSlug),
        path.join(distRoot, drSlug),
        path.join(distRoot, cleanSlug)
      );
    }

    const writtenFiles: string[] = [];

    for (const dir of targetDirs) {
      ensureDir(dir);
      const filePath = path.join(dir, 'index.html');
      fs.writeFileSync(filePath, doctorHtml, 'utf8');
      writtenFiles.push(filePath);
    }

    // 2. Generate 4 Automated SEO Articles for this Doctor
    const angles = ['about', 'cases', 'local', 'guide'] as const;
    const generatedArticleUrls: string[] = [];

    for (const angle of angles) {
      try {
        const articleHtml = buildArticleStaticHtml({
          doctor: doctorObj,
          angleKey: angle,
          baseUrl: BASE_URL
        });

        const fileNames = {
          about: 'about.html',
          cases: 'clinical-cases.html',
          local: `dentist-in-${doctorObj.locationAddress ? doctorObj.locationAddress.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'city'}.html`,
          guide: 'patient-guide.html'
        };
        const fileName = fileNames[angle];

        const articleDirs = [
          path.join(publicRoot, 'dr', cleanSlug, 'articles'),
          path.join(publicRoot, 'dr', drSlug, 'articles'),
          path.join(publicRoot, drSlug, 'articles')
        ];
        if (fs.existsSync(distRoot)) {
          articleDirs.push(
            path.join(distRoot, 'dr', cleanSlug, 'articles'),
            path.join(distRoot, 'dr', drSlug, 'articles'),
            path.join(distRoot, drSlug, 'articles')
          );
        }

        for (const aDir of articleDirs) {
          ensureDir(aDir);
          fs.writeFileSync(path.join(aDir, fileName), articleHtml, 'utf8');
        }

        generatedArticleUrls.push(`${BASE_URL}/dr/${cleanSlug}/articles/${fileName}`);
      } catch (aErr: any) {
        console.warn(`[API] Article angle ${angle} skipped for ${cleanSlug}:`, aErr.message);
      }
    }

    // 3. Update content/public-websites.json
    const websitesJsonPath = path.join(__dirname, 'content', 'public-websites.json');
    let publicWebsites: any[] = [];
    try {
      if (fs.existsSync(websitesJsonPath)) {
        publicWebsites = JSON.parse(fs.readFileSync(websitesJsonPath, 'utf8'));
      }
    } catch {
      publicWebsites = [];
    }

    const existingIdx = publicWebsites.findIndex(
      (w) => w.slug === cleanSlug || w.slug === drSlug || w.uid === doctorObj.id
    );

    const recordToSave = {
      ...doctorObj,
      cases: doctorCases,
      updatedAt: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      publicWebsites[existingIdx] = recordToSave;
    } else {
      publicWebsites.push(recordToSave);
    }

    ensureDir(path.dirname(websitesJsonPath));
    fs.writeFileSync(websitesJsonPath, JSON.stringify(publicWebsites, null, 2), 'utf8');

    // 4. Update Sitemap
    const sitemapPath = path.join(publicRoot, 'sitemap.xml');
    if (fs.existsSync(sitemapPath)) {
      try {
        let sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
        const mainUrl = `${BASE_URL}/dr/${cleanSlug}/`;
        if (!sitemapContent.includes(mainUrl)) {
          const newEntries = [
            `  <url><loc>${mainUrl}</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>`,
            ...generatedArticleUrls.map(
              (u) => `  <url><loc>${u}</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`
            )
          ].join('\n');
          sitemapContent = sitemapContent.replace('</urlset>', `${newEntries}\n</urlset>`);
          fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');
          if (fs.existsSync(path.join(distRoot, 'sitemap.xml'))) {
            fs.writeFileSync(path.join(distRoot, 'sitemap.xml'), sitemapContent, 'utf8');
          }
        }
      } catch (sErr) {
        console.warn('[API] Sitemap update error:', sErr);
      }
    }

    // 5. Notify IndexNow
    const allUrlsToNotify = [
      `${BASE_URL}/dr/${cleanSlug}/`,
      ...generatedArticleUrls
    ];
    void submitIndexNowUrls(allUrlsToNotify).catch((inErr) => {
      console.warn('[API] IndexNow notify non-fatal error:', inErr);
    });

    console.log(`[API] ✅ Successfully generated static HTML files for Dr. ${cleanSlug}`);

    return res.json({
      ok: true,
      slug: cleanSlug,
      publicUrl: `/dr/${cleanSlug}`,
      doctorHtmlLength: doctorHtml.length,
      writtenFilesCount: writtenFiles.length,
      articlesCount: generatedArticleUrls.length
    });
  } catch (err: any) {
    console.error('[API] Error in generate-doctor-html:', err);
    return res.status(500).json({ ok: false, error: 'Static page generation failed.' });
  }
});

// -------------------------------------------------------------
// 2. API: Trigger IndexNow Ping
// -------------------------------------------------------------
app.post('/api/notify-indexnow', requireAdmin, limitAdminRequests, async (req: Request, res: Response) => {
  try {
    const urls = req.body?.urls ?? [];
    if (!Array.isArray(urls) || urls.length > 100) {
      return res.status(400).json({ ok: false, error: 'Provide at most 100 site URLs.' });
    }
    const allowedOrigin = new URL(BASE_URL).origin;
    const validUrls = urls.every((value) => {
      if (typeof value !== 'string') return false;
      try {
        const url = new URL(value);
        return url.origin === allowedOrigin && url.protocol === 'https:';
      } catch {
        return false;
      }
    });
    if (!validUrls) {
      return res.status(400).json({ ok: false, error: 'URLs must use the configured HTTPS site origin.' });
    }
    const result = await submitIndexNowUrls(urls);
    return res.json(result);
  } catch (err: any) {
    console.error('[API] IndexNow notification failed:', err);
    return res.status(500).json({ ok: false, error: 'IndexNow notification failed.' });
  }
});

// -------------------------------------------------------------
// 3. API: Get Public Websites Catalog
// -------------------------------------------------------------
app.get('/api/public-websites', (_req: Request, res: Response) => {
  const websitesJsonPath = path.join(__dirname, 'content', 'public-websites.json');
  if (fs.existsSync(websitesJsonPath)) {
    return res.sendFile(websitesJsonPath);
  }
  return res.json([]);
});

// -------------------------------------------------------------
// 4. Intercept Doctor Pages & Serve REAL Static HTML Directly
// -------------------------------------------------------------
app.get(['/dr/:slug', '/dr/:slug/', '/dr:slug', '/dr:slug/'], (req: Request, res: Response, next) => {
  const rawSlug = req.params.slug;
  if (!rawSlug) return next();

  const cleanSlug = normalizeDoctorSlug(rawSlug);
  const possiblePaths = [
    path.join(__dirname, 'public', 'dr', cleanSlug, 'index.html'),
    path.join(__dirname, 'public', `dr${cleanSlug}`, 'index.html'),
    path.join(__dirname, 'public', 'dr', `dr${cleanSlug}`, 'index.html'),
    path.join(__dirname, 'public', cleanSlug, 'index.html'),
    path.join(__dirname, 'dist', 'dr', cleanSlug, 'index.html'),
    path.join(__dirname, 'dist', `dr${cleanSlug}`, 'index.html')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      res.type('text/html; charset=utf-8');
      return res.sendFile(p);
    }
  }

  // Not found on disk, pass to SPA router
  next();
});

// -------------------------------------------------------------
// 5. Intercept Doctor Articles & Serve REAL Static HTML Directly
// -------------------------------------------------------------
app.get(['/dr/:slug/articles/:articleFile', '/dr:slug/articles/:articleFile'], (req: Request, res: Response, next) => {
  const { slug, articleFile } = req.params;
  const cleanSlug = normalizeDoctorSlug(slug);

  const possiblePaths = [
    path.join(__dirname, 'public', 'dr', cleanSlug, 'articles', articleFile),
    path.join(__dirname, 'public', `dr${cleanSlug}`, 'articles', articleFile),
    path.join(__dirname, 'dist', 'dr', cleanSlug, 'articles', articleFile)
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      res.type('text/html; charset=utf-8');
      return res.sendFile(p);
    }
  }

  next();
});

// -------------------------------------------------------------
// 6. Vite Dev Server / Production Static Serving
// -------------------------------------------------------------
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist assets and fallback to index.html
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 PortfolioHubs Full-Stack Server running at http://0.0.0.0:${PORT}`);
    console.log(`⚡ Mode: ${isProd ? 'Production' : 'Development'}`);
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
