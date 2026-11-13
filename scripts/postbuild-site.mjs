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

async function readSiteUrl() {
  const linksFile = join(site, 'src', 'app', 'core', 'links.ts');
  const links = await readFile(join(root, linksFile), 'utf8');
  const match = /export const SITE_URL = '([^']+)'/.exec(links);
  if (!match) {
    throw new Error(`SITE_URL not found in ${linksFile}`);
  }
  return match[1];
}

const isUnlisted = (html) => html.includes('http-equiv="refresh"') || html.includes('content="noindex"');

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
