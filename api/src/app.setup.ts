import { StandardSchemaValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { Env } from './config/env.js';
import { VisitorThrottlerGuard } from './security/visitor-throttler.guard.js';

/** Largest JSON body; every JSON request is a few short fields */
const JSON_LIMIT = '10kb';

/** Everything the API sets up around its modules; shared by main.ts and the end-to-end tests */
export function setUpApp(app: NestExpressApplication): void {
  const config = app.get<ConfigService<Env, true>>(ConfigService);
  app.useBodyParser('json', { limit: JSON_LIMIT });
  app.useGlobalPipes(new StandardSchemaValidationPipe());
  app.enableCors({
    origin: config.get('CORS_ORIGINS', { infer: true }),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });
  app.disable('x-powered-by');
  VisitorThrottlerGuard.trustCloudflare = config.get('TRUST_CLOUDFLARE', {
    infer: true,
  });
}
