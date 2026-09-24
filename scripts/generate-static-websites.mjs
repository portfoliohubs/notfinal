import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { buildDoctorStaticHtml } from './doctor-template.mjs';
import { buildArticleStaticHtml } from './generate-static-pages.mjs';

const sourcePath = path.resolve(
  process.env.PUBLIC_WEBSITES_FILE || 'content/public-websites.json',
);
const outputRoot = path.resolve('dist');
const publicRoot = path.resolve('public');
const baseUrl = process.env.BASE_URL || 'https://portfoliohubs.github.io';

const source = JSON.parse(await readFile(sourcePath, 'utf8'));
if (!Array.isArray(source)) {
  throw new Error(`Expected an array in ${sourcePath}`);
}

const seenSlugs = new Set();

for (const doctor of source) {
  if (!doctor.slug && !doctor.username && !doctor.fullName) {
    throw new Error('Every static website requires slug or fullName.');
  }

  const rawSlug = String(doctor.slug || doctor.username || doctor.fullName)
    .trim()
    .toLowerCase()
    .replace(/^dr-?/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'doctor';

  if (seenSlugs.has(rawSlug)) {
    continue;
  }
  seenSlugs.add(rawSlug);

  const cleanSlug = rawSlug;
  const drSlug = `dr${cleanSlug}`;
  const cases = Array.isArray(doctor.cases) ? doctor.cases : [];

  // Generate full interactive static HTML
  const doctorHtml = buildDoctorStaticHtml({
    doctor,
    cases,
    baseUrl
  });

  // Target directories for dist/ and public/
  const targetDirs = [
    path.join(outputRoot, 'dr', cleanSlug),
    path.join(outputRoot, drSlug),
    path.join(outputRoot, cleanSlug),
    path.join(publicRoot, 'dr', cleanSlug),
    path.join(publicRoot, drSlug),
    path.join(publicRoot, cleanSlug)
  ];

  for (const dir of targetDirs) {
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), doctorHtml, 'utf8');
  }

  // Generate 4 automated SEO articles for this doctor
  const angles = ['about', 'cases', 'local', 'guide'];
  for (const angle of angles) {
    try {
      const articleHtml = buildArticleStaticHtml({
        doctor,
        angleKey: angle,
        baseUrl
      });
      const fileNames = {
        about: 'about.html',
        cases: 'clinical-cases.html',
        local: `dentist-in-${doctor.locationAddress ? doctor.locationAddress.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'city'}.html`,
        guide: 'patient-guide.html'
      };
      const fileName = fileNames[angle];

      const articleDirs = [
        path.join(outputRoot, 'dr', cleanSlug, 'articles'),
        path.join(publicRoot, 'dr', cleanSlug, 'articles'),
        path.join(outputRoot, drSlug, 'articles'),
        path.join(publicRoot, drSlug, 'articles')
      ];

      for (const aDir of articleDirs) {
        await mkdir(aDir, { recursive: true });
        await writeFile(path.join(aDir, fileName), articleHtml, 'utf8');
      }
    } catch (articleErr) {
      console.warn(`[ArticleGen] Skipped article angle ${angle} for ${cleanSlug}:`, articleErr.message);
    }
  }

  console.log(`✅ Generated rich static doctor website and articles for: ${doctor.fullName} (${cleanSlug})`);
}

// Ensure 404.html exists in dist for GitHub Pages SPA routing fallback
try {
  const indexPath = path.join(outputRoot, 'index.html');
  const notFoundPath = path.join(outputRoot, '404.html');
  const indexContent = await readFile(indexPath, 'utf8');
  await writeFile(notFoundPath, indexContent, 'utf8');
  console.log('✅ Created dist/404.html for GitHub Pages SPA fallback.');
} catch (err) {
  console.warn('⚠️ Note on 404.html fallback creation:', err.message);
}

console.log(`Generated ${seenSlugs.size} static doctor website page(s).`);

