import { Body, Controller, Get, Header, HttpCode, Param, Put, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { AdminGuard, SuperAdminGuard } from '../security/admin.guard.js';
import type { GameSlug } from '../shared/catalog.js';
import { gameSchema } from '../shared/catalog.js';
import { GameSettingsService, GameSwitch } from './game-settings.service.js';

const switchSchema = z.object({ enabled: z.boolean() });
type SwitchInput = z.infer<typeof switchSchema>;

@Controller('v1/games')
export class GameSettingsController {
  constructor(private readonly settings: GameSettingsService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  async list(): Promise<{ games: GameSwitch[] }> {
    return { games: await this.settings.list() };
  }
}

@Controller('admin')
@UseGuards(AdminGuard)
export class GameSettingsAdminController {
  constructor(private readonly settings: GameSettingsService) {}

  @Get('check')
  @HttpCode(204)
  check(): void {}

  @UseGuards(SuperAdminGuard)
  @Put('games/:game')
  @HttpCode(204)
  async set(
    @Param('game', { schema: gameSchema }) game: GameSlug,
    @Body({ schema: switchSchema }) { enabled }: SwitchInput,
  ): Promise<void> {
    await this.settings.set(game, enabled);
  }
}
