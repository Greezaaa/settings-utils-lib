import { StandardSchemaValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { Env } from './config/env.js';
import { VisitorThrottlerGuard } from './security/visitor-throttler.guard.js';

const JSON_LIMIT = '10kb';
const PREFLIGHT_CACHE_SECONDS = 2 * 60 * 60;

export function setUpApp(app: NestExpressApplication): void {
  const config = app.get<ConfigService<Env, true>>(ConfigService);
  app.useBodyParser('json', { limit: JSON_LIMIT });
  app.useGlobalPipes(new StandardSchemaValidationPipe());
  app.enableCors({
    origin: config.get('CORS_ORIGINS', { infer: true }),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    maxAge: PREFLIGHT_CACHE_SECONDS,
  });
  app.disable('x-powered-by');
  VisitorThrottlerGuard.trustCloudflare = config.get('TRUST_CLOUDFLARE', {
    infer: true,
  });
}
