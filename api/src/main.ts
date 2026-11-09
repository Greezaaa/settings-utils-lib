import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { setUpApp } from './app.setup.js';
import type { Env } from './config/env.js';
import { requestLog } from './logging/request-log.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });
  setUpApp(app);
  // Only the running API logs each request; the end-to-end tests set the app up without it
  app.use(requestLog());
  app.enableShutdownHooks();
  await app.listen(
    app
      .get<ConfigService<Env, true>>(ConfigService)
      .get('PORT', { infer: true }),
  );
}

await bootstrap();
