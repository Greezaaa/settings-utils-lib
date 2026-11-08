import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { RoomsModule } from './rooms/rooms.module.js';
import type { RoomsEnv } from './rooms/rooms-env.js';

/** Starts the rooms service (rooms.su-labs.dev), a separate process from the API: `node dist/rooms-main.js` */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(RoomsModule);
  app.useWebSocketAdapter(new WsAdapter(app));
  app.enableShutdownHooks();
  await app.listen(
    app
      .get<ConfigService<RoomsEnv, true>>(ConfigService)
      .get('PORT', { infer: true }),
  );
}

await bootstrap();
