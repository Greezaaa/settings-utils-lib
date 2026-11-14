import { BadRequestException, Body, Controller, Delete, Get, Header, HttpCode, Param, Put, StreamableFile, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { z } from 'zod';
import { AdminGuard, SuperAdminGuard } from '../security/admin.guard.js';
import type { GameCategory, GameSlug } from '../shared/catalog.js';
import { categorySchema, gameSchema } from '../shared/catalog.js';
import { IMAGE_MAX_BYTES } from '../shared/clean-image.js';
import { GameCategoryList, GameSettingsService, GameSwitch } from './game-settings.service.js';
import { GameThumbnailsService, ThumbnailVersion } from './game-thumbnails.service.js';

const GAME_CATEGORY_LIMIT = 4;
const switchSchema = z.object({ enabled: z.boolean() });
type SwitchInput = z.infer<typeof switchSchema>;
const categoriesSchema = z.object({ categories: z.array(categorySchema).min(1).max(GAME_CATEGORY_LIMIT) });
type CategoriesInput = { categories: GameCategory[] };

@Controller('v1/games')
export class GameSettingsController {
  constructor(
    private readonly settings: GameSettingsService,
    private readonly thumbnails: GameThumbnailsService,
  ) {}

  @Get()
  @Header('Cache-Control', 'no-cache')
  async list(): Promise<{ games: GameSwitch[]; categories: GameCategoryList[]; thumbnails: ThumbnailVersion[] }> {
    const [games, categories, thumbnails] = await Promise.all([
      this.settings.list(),
      this.settings.listCategories(),
      this.thumbnails.list(),
    ]);
    return { games, categories, thumbnails };
  }

  @Get(':game/thumbnail')
  @Header('Content-Type', 'image/webp')
  @Header('Cache-Control', 'public, max-age=31536000, immutable')
  async thumbnail(@Param('game', { schema: gameSchema }) game: GameSlug): Promise<StreamableFile> {
    return new StreamableFile(await this.thumbnails.read(game));
  }
}

@Controller('admin')
@UseGuards(AdminGuard)
export class GameSettingsAdminController {
  constructor(
    private readonly settings: GameSettingsService,
    private readonly thumbnails: GameThumbnailsService,
  ) {}

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

  @UseGuards(SuperAdminGuard)
  @Put('games/:game/thumbnail')
  @HttpCode(204)
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: IMAGE_MAX_BYTES, files: 1, fields: 0, parts: 1 } }))
  async setThumbnail(
    @Param('game', { schema: gameSchema }) game: GameSlug,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<void> {
    if (!image) {
      throw new BadRequestException('Send the picture as "image"');
    }
    await this.thumbnails.save(game, image.buffer);
  }

  @UseGuards(SuperAdminGuard)
  @Delete('games/:game/thumbnail')
  @HttpCode(204)
  async removeThumbnail(@Param('game', { schema: gameSchema }) game: GameSlug): Promise<void> {
    await this.thumbnails.remove(game);
  }
}
