import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const sourcePath = path.resolve(
  process.env.PUBLIC_WEBSITES_FILE || 'content/public-websites.json',
);
const outputRoot = path.resolve('dist');

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const source = JSON.parse(await readFile(sourcePath, 'utf8'));
if (!Array.isArray(source)) {
  throw new Error(`Expected an array in ${sourcePath}`);
}

const seenSlugs = new Set();

for (const website of source) {
  if (!website.slug || !website.fullName) {
    throw new Error('Every static website requires slug and fullName.');
  }

  const slug = String(website.slug).replace(/^dr/, '').toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(`Invalid website slug "${website.slug}". Use lowercase letters, numbers, and hyphens.`);
  }
  if (seenSlugs.has(slug)) {
    throw new Error(`Duplicate website slug "${slug}".`);
  }
  seenSlugs.add(slug);
  const title = escapeHtml(website.fullName);
  const description = escapeHtml(
    website.title || 'Dental professional website powered by PortfolioHubs',
  );
  const image = website.profilePhoto
    ? `<img src="${escapeHtml(website.profilePhoto)}" alt="${title}" />`
    : '';
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title} | PortfolioHubs</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="https://portfoliohubs.pages.dev/dr${escapeHtml(slug)}" />
    <script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: website.fullName,
      jobTitle: website.title || 'Dental professional',
      url: `https://portfoliohubs.pages.dev/dr${slug}`,
      image: website.profilePhoto || undefined,
      sameAs: Array.isArray(website.sameAs) ? website.sameAs : undefined,
    }).replace(/</g, '\\u003c')}</script>
  </head>
  <body>
    <main>
      ${image}
      <h1>${title}</h1>
      <p>${description}</p>
    </main>
  </body>
</html>`;

  const outputDirectory = path.join(outputRoot, `dr${slug}`);
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(path.join(outputDirectory, 'index.html'), html, 'utf8');
}

console.log(`Generated ${source.length} static doctor website page(s).`);
