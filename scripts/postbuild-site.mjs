// Runs after `ng build <site>` for a site of this workspace (`web` or `games`), e.g.
// `node scripts/postbuild-site.mjs games`. Prepares the static output for hosting as plain files:
// - sitemap.xml, built from the pages that were actually prerendered
// - 404.html, the prerendered not-found page (route /404), for the server to send with a 404 status
import { readdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITES = ['web', 'games'];

const site = process.argv[2];
if (!SITES.includes(site)) {
  throw new Error(`Usage: node scripts/postbuild-site.mjs <${SITES.join('|')}>`);
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = join(root, 'dist', site, 'browser');

/** The public site address, read from the app so it is defined in one place */
async function readSiteUrl() {
  const linksFile = join(site, 'src', 'app', 'core', 'links.ts');
  const links = await readFile(join(root, linksFile), 'utf8');
  const match = /export const SITE_URL = '([^']+)'/.exec(links);
  if (!match) {
    throw new Error(`SITE_URL not found in ${linksFile}`);
  }
  return match[1];
}

/** Pages that search engines should not list: redirects and pages marked noindex */
const isUnlisted = (html) => html.includes('http-equiv="refresh"') || html.includes('content="noindex"');

/** Every prerendered index.html worth listing in the sitemap */
async function findPages(dir) {
  const pages = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      pages.push(...(await findPages(path)));
    } else if (entry.name === 'index.html' && !isUnlisted(await readFile(path, 'utf8'))) {
      pages.push(path);
    }
  }
  return pages;
}

/** The prerendered /404 page becomes 404.html; its folder goes, so /404/ isn't a page of its own */
async function publishNotFoundPage() {
  const page = join(outputDir, '404', 'index.html');
  await rename(page, join(outputDir, '404.html'));
  await rm(join(outputDir, '404'), { recursive: true });
}

await publishNotFoundPage();

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

console.log(`${site} sitemap.xml: ${urls.length} pages. 404.html: not-found page.`);
