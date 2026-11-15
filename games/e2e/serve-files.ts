import { createReadStream, statSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { extname, join, normalize } from 'node:path';

const TYPES: Readonly<Record<string, string>> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain; charset=utf-8',
};

const isFile = (path: string): boolean => statSync(path, { throwIfNoEntry: false })?.isFile() === true;

function find(root: string, url: string): string | null {
  const path = normalize(decodeURIComponent(new URL(url, 'http://localhost').pathname)).replace(/^(\.\.[/\\])+/, '');
  const file = join(root, path);
  return [file, join(file, 'index.html')].find(isFile) ?? null;
}

export function serveFrom(root: string, request: IncomingMessage, response: ServerResponse): void {
  const file = find(root, request.url ?? '/');
  const served = file ?? join(root, '404.html');
  response.writeHead(file ? 200 : 404, {
    'Content-Type': TYPES[extname(served)] ?? 'application/octet-stream',
    'Cache-Control': 'no-cache',
  });
  createReadStream(served).pipe(response);
}
