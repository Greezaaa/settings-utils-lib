import { Module } from '@nestjs/common';
import { FeatureFlagsModule } from '../feature-flags/feature-flags.module.js';
import { GameSettingsModule } from '../game-settings/game-settings.module.js';
import { NewsModule } from '../news/news.module.js';
import { SiteController } from './site.controller.js';

@Module({
  imports: [FeatureFlagsModule, GameSettingsModule, NewsModule],
  controllers: [SiteController],
})
export class SiteModule {}
