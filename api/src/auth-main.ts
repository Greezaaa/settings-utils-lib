import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AuthAppModule } from './auth-app.module.js';
import { setUpApp } from './app.setup.js';
import type { Env } from './config/env.js';
import { requestLog } from './logging/request-log.js';

/** Starts the auth service (auth.su-labs.dev), a separate process from the API: `node dist/auth-main.js` */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AuthAppModule, {
    bodyParser: false,
  });
  setUpApp(app);
  app.use(requestLog());
  app.enableShutdownHooks();
  await app.listen(
    app
      .get<ConfigService<Env, true>>(ConfigService)
      .get('PORT', { infer: true }),
  );
}

await bootstrap();
