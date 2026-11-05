// Runs after `ng build web`. Prepares the static output for GitHub Pages:
// - sitemap.xml, built from the pages that were actually prerendered
// - 404.html, the client-only app shell, so unknown paths still load the app
import { copyFile, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const outputDir = join(root, 'dist', 'web', 'browser');

/** The public site address, read from the app so it is defined in one place */
async function readSiteUrl() {
  const links = await readFile(join(root, 'web', 'src', 'app', 'core', 'links.ts'), 'utf8');
  const match = /export const SITE_URL = '([^']+)'/.exec(links);
  if (!match) {
    throw new Error('SITE_URL not found in web/src/app/core/links.ts');
  }
  return match[1];
}

/** Every prerendered index.html, skipping redirect pages */
async function findPages(dir) {
  const pages = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      pages.push(...(await findPages(path)));
    } else if (entry.name === 'index.html' && !(await readFile(path, 'utf8')).includes('http-equiv="refresh"')) {
      pages.push(path);
    }
  }
  return pages;
}

const siteUrl = await readSiteUrl();
const today = new Date().toISOString().slice(0, 10);
const urls = (await findPages(outputDir))
  .map((page) => relative(outputDir, dirname(page)).split(sep).filter(Boolean).join('/'))
  .sort()
  .map((path) => `${siteUrl}/${path ? `${path}/` : ''}`);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`;
await writeFile(join(outputDir, 'sitemap.xml'), sitemap);
await copyFile(join(outputDir, 'index.csr.html'), join(outputDir, '404.html'));

console.log(`sitemap.xml: ${urls.length} pages. 404.html: app shell.`);
