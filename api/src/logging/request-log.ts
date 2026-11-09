import { Logger } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

/** Path segments that come before a secret (invite and password-reset links): the secret is never logged */
const BEFORE_SECRET = new Set(['invite', 'reset']);

/** Requests not worth a line: the container's health check, and browsers' CORS checks before each request */
const isNoise = (method: string, path: string): boolean =>
  method === 'OPTIONS' || path === '/health';

/** A request's path for the log: no query string, and `***` for secrets in links */
export function loggedPath(url: string): string {
  const segments = url.split(/[?#]/)[0].split('/');
  return segments
    .map((segment, index) =>
      index > 0 && BEFORE_SECRET.has(segments[index - 1]) ? '***' : segment,
    )
    .join('/');
}

/** One line per request, e.g. `POST /auth/login 401 120ms` */
export const requestLine = (
  method: string,
  path: string,
  status: number,
  milliseconds: number,
): string => `${method} ${path} ${status} ${Math.round(milliseconds)}ms`;

/**
 * Logs every request when it's answered: the method, path, status and time. Errors (5xx) log as errors and refused
 * requests (4xx) as warnings, so they stand out. Nothing about the visitor is logged: no address, no body, no query.
 * Watch it with `docker compose logs -f api`.
 */
export function requestLog(): (
  request: Request,
  response: Response,
  next: NextFunction,
) => void {
  const logger = new Logger('HTTP');
  return (request, response, next) => {
    const path = loggedPath(request.originalUrl);
    if (isNoise(request.method, path)) {
      next();
      return;
    }
    const started = performance.now();
    response.on('finish', () => {
      const line = requestLine(
        request.method,
        path,
        response.statusCode,
        performance.now() - started,
      );
      if (response.statusCode >= 500) {
        logger.error(line);
      } else if (response.statusCode >= 400) {
        logger.warn(line);
      } else {
        logger.log(line);
      }
    });
    next();
  };
}
