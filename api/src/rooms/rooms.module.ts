import { Controller, Get, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RoomsGateway } from './rooms.gateway.js';
import { validateRoomsEnv } from './rooms-env.js';

/** For Docker and uptime checks: answers when the rooms service is up */
@Controller('health')
class RoomsHealthController {
  @Get()
  check(): { status: 'ok' } {
    return { status: 'ok' };
  }
}

/** rooms.su-labs.dev: multiplayer rooms over WebSockets; no database, rooms live in memory */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateRoomsEnv }),
  ],
  controllers: [RoomsHealthController],
  providers: [RoomsGateway],
})
export class RoomsModule {}
