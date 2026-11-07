import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameSlug } from '../shared/catalog.js';
import { today } from '../shared/day.js';
import { GameSetting } from './game-setting.entity.js';

export interface GameSwitch {
  readonly game: string;
  readonly enabled: boolean;
}

@Injectable()
export class GameSettingsService {
  constructor(
    @InjectRepository(GameSetting)
    private readonly settings: Repository<GameSetting>,
  ) {}

  /** The games switched on or off; games never switched aren't listed and keep their default */
  async list(): Promise<GameSwitch[]> {
    const rows = await this.settings.find({ order: { game: 'ASC' } });
    return rows.map(({ game, enabled }) => ({ game, enabled }));
  }

  async set(game: GameSlug, enabled: boolean, day = today()): Promise<void> {
    await this.settings.upsert({ game, enabled, updated: day }, ['game']);
  }
}
