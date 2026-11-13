import { Controller, Get, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RoomsGateway } from './rooms.gateway.js';
import { validateRoomsEnv } from './rooms-env.js';

@Controller('health')
class RoomsHealthController {
  @Get()
  check(): { status: 'ok' } {
    return { status: 'ok' };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateRoomsEnv }),
  ],
  controllers: [RoomsHealthController],
  providers: [RoomsGateway],
})
export class RoomsModule {}
