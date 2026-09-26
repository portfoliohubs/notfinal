import express, { Request, Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { buildDoctorStaticHtml } from './scripts/doctor-template.mjs';
import { buildArticleStaticHtml } from './scripts/generate-static-pages.mjs';
import { submitIndexNowUrls } from './scripts/notify-indexnow.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';
const BASE_URL = process.env.BASE_URL || 'https://portfoliohubs.github.io';

// Increase payload limit for base64 clinical photos
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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
app.post('/api/admin/generate-doctor-html', async (req: Request, res: Response) => {
  try {
    const { doctor, cases = [] } = req.body;
    if (!doctor || (!doctor.fullName && !doctor.fullNameAr)) {
      return res.status(400).json({ ok: false, error: 'Doctor data with fullName is required.' });
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
      cases: Array.isArray(cases) && cases.length > 0 ? cases : (doctorObj.cases || []),
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
      cases: Array.isArray(cases) && cases.length > 0 ? cases : (doctorObj.cases || []),
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
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 2. API: Trigger IndexNow Ping
// -------------------------------------------------------------
app.post('/api/notify-indexnow', async (req: Request, res: Response) => {
  try {
    const { urls = [] } = req.body;
    const result = await submitIndexNowUrls(urls);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
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

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
