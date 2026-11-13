import { Logger } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

const BEFORE_SECRET = new Set(['invite', 'reset']);

const isNoise = (method: string, path: string): boolean =>
  method === 'OPTIONS' || path === '/health';

export function loggedPath(url: string): string {
  const segments = url.split(/[?#]/)[0].split('/');
  return segments
    .map((segment, index) =>
      index > 0 && BEFORE_SECRET.has(segments[index - 1]) ? '***' : segment,
    )
    .join('/');
}

export const requestLine = (
  method: string,
  path: string,
  status: number,
  milliseconds: number,
): string => `${method} ${path} ${status} ${Math.round(milliseconds)}ms`;

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
