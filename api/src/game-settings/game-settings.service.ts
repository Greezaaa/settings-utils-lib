import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { GameCategoryList, GameSwitch } from '../contracts/site.contract.js';
import { GameCategory, GameSlug } from '../shared/catalog.js';
import { today } from '../shared/day.js';
import { GameCategories } from './game-categories.entity.js';
import { GameSetting } from './game-setting.entity.js';

@Injectable()
export class GameSettingsService {
  constructor(
    @InjectRepository(GameSetting)
    private readonly settings: Repository<GameSetting>,
    @InjectRepository(GameCategories)
    private readonly categories: Repository<GameCategories>,
  ) {}

  async list(): Promise<GameSwitch[]> {
    const rows = await this.settings.find({ order: { game: 'ASC' } });
    return rows.map(({ game, enabled }) => ({ game, enabled }));
  }

  async set(game: GameSlug, enabled: boolean, day = today()): Promise<void> {
    await this.settings.upsert({ game, enabled, updated: day }, ['game']);
  }

  async listCategories(): Promise<GameCategoryList[]> {
    const rows = await this.categories.find({ order: { game: 'ASC' } });
    return rows.map(({ game, categories }) => ({ game, categories }));
  }

  async setCategories(
    game: GameSlug,
    categories: readonly GameCategory[],
    day = today(),
  ): Promise<void> {
    await this.categories.upsert(
      { game, categories: [...new Set(categories)], updated: day },
      ['game'],
    );
  }
}
