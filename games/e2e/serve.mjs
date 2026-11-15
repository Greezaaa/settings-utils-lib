import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const ROOT = join(import.meta.dirname, '../../dist/games/browser');
const PORT = Number(process.env.PORT ?? 4320);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.webmanifest': 'application/manifest+json',
};

const isFile = (path) => statSync(path, { throwIfNoEntry: false })?.isFile() === true;

function find(url) {
  const path = normalize(decodeURIComponent(new URL(url, 'http://localhost').pathname)).replace(/^(\.\.[/\\])+/, '');
  const file = join(ROOT, path);
  return [file, join(file, 'index.html')].find(isFile) ?? null;
}

createServer((request, response) => {
  const file = find(request.url ?? '/');
  const served = file ?? join(ROOT, '404.html');
  response.writeHead(file ? 200 : 404, { 'Content-Type': TYPES[extname(served)] ?? 'application/octet-stream' });
  createReadStream(served).pipe(response);
}).listen(PORT);
