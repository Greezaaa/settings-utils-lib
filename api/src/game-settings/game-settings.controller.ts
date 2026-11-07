import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import { AdminTokenGuard } from '../security/admin-token.guard.js';
import type { GameSlug } from '../shared/catalog.js';
import { gameSchema } from '../shared/catalog.js';
import { GameSettingsService, GameSwitch } from './game-settings.service.js';

const switchSchema = z.object({ enabled: z.boolean() });
type SwitchInput = z.infer<typeof switchSchema>;

/** Which games are open to the public, read by the games site when it starts */
@Controller('v1/games')
export class GameSettingsController {
  constructor(private readonly settings: GameSettingsService) {}

  @Get()
  async list(): Promise<{ games: GameSwitch[] }> {
    return { games: await this.settings.list() };
  }
}

/** For the site's admin: check the token, and switch games on or off */
@Controller('admin')
@UseGuards(AdminTokenGuard)
export class GameSettingsAdminController {
  constructor(private readonly settings: GameSettingsService) {}

  /** Answers 204 when the token is right, so the admin page can tell before showing its switches */
  @Get('check')
  @HttpCode(204)
  check(): void {}

  @Put('games/:game')
  @HttpCode(204)
  async set(
    @Param('game', { schema: gameSchema }) game: GameSlug,
    @Body({ schema: switchSchema }) { enabled }: SwitchInput,
  ): Promise<void> {
    await this.settings.set(game, enabled);
  }
}
