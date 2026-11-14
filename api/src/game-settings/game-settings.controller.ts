import { Body, Controller, Get, Header, HttpCode, Param, Put, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { AdminGuard, SuperAdminGuard } from '../security/admin.guard.js';
import type { GameCategory, GameSlug } from '../shared/catalog.js';
import { categorySchema, gameSchema } from '../shared/catalog.js';
import { GameCategoryList, GameSettingsService, GameSwitch } from './game-settings.service.js';

const GAME_CATEGORY_LIMIT = 4;
const switchSchema = z.object({ enabled: z.boolean() });
type SwitchInput = z.infer<typeof switchSchema>;
const categoriesSchema = z.object({ categories: z.array(categorySchema).min(1).max(GAME_CATEGORY_LIMIT) });
type CategoriesInput = { categories: GameCategory[] };

@Controller('v1/games')
export class GameSettingsController {
  constructor(private readonly settings: GameSettingsService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  async list(): Promise<{ games: GameSwitch[]; categories: GameCategoryList[] }> {
    const [games, categories] = await Promise.all([this.settings.list(), this.settings.listCategories()]);
    return { games, categories };
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

  @UseGuards(SuperAdminGuard)
  @Put('games/:game/categories')
  @HttpCode(204)
  async setCategories(
    @Param('game', { schema: gameSchema }) game: GameSlug,
    @Body({ schema: categoriesSchema }) { categories }: CategoriesInput,
  ): Promise<void> {
    await this.settings.setCategories(game, categories);
  }
}
