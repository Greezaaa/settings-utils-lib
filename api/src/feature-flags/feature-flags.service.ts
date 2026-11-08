import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeatureId } from '../shared/catalog.js';
import { today } from '../shared/day.js';
import { FeatureFlag } from './feature-flag.entity.js';

export interface FeatureSwitch {
  readonly feature: string;
  readonly enabled: boolean;
}

@Injectable()
export class FeatureFlagsService {
  constructor(
    @InjectRepository(FeatureFlag)
    private readonly flags: Repository<FeatureFlag>,
  ) {}

  /** The features switched on or off; features never switched aren't listed and keep their default */
  async list(): Promise<FeatureSwitch[]> {
    const rows = await this.flags.find({ order: { feature: 'ASC' } });
    return rows.map(({ feature, enabled }) => ({ feature, enabled }));
  }

  async set(
    feature: FeatureId,
    enabled: boolean,
    day = today(),
  ): Promise<void> {
    await this.flags.upsert({ feature, enabled, updated: day }, ['feature']);
  }
}
