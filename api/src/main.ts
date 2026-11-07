import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { setUpApp } from './app.setup.js';
import type { Env } from './config/env.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });
  setUpApp(app);
  app.enableShutdownHooks();
  await app.listen(
    app
      .get<ConfigService<Env, true>>(ConfigService)
      .get('PORT', { infer: true }),
  );
}

await bootstrap();
