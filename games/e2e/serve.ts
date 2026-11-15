import { createServer } from 'node:http';
import { join } from 'node:path';
import { serveFrom } from './serve-files.ts';

const ROOT = join(import.meta.dirname, '../../dist/games/browser');
const PORT = Number(process.env['PORT'] ?? 4320);

createServer((request, response) => serveFrom(ROOT, request, response)).listen(PORT);
