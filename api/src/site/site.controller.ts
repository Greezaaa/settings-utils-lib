import { createHash } from 'node:crypto';
import { Controller, Get, Header } from '@nestjs/common';
import type { SiteView } from '../contracts/site.contract.js';
import { FeatureFlagsService } from '../feature-flags/feature-flags.service.js';
import { GameSettingsService } from '../game-settings/game-settings.service.js';
import { GameThumbnailsService } from '../game-settings/game-thumbnails.service.js';
import { NewsService } from '../news/news.service.js';

const NEWS_VERSION_LENGTH = 16;

@Controller('v1/site')
export class SiteController {
  constructor(
    private readonly settings: GameSettingsService,
    private readonly thumbnails: GameThumbnailsService,
    private readonly flags: FeatureFlagsService,
    private readonly news: NewsService,
  ) {}

  @Get()
  @Header('Cache-Control', 'no-cache')
  async site(): Promise<SiteView> {
    const [games, categories, thumbnails, features, news] = await Promise.all([
      this.settings.list(),
      this.settings.listCategories(),
      this.thumbnails.list(),
      this.flags.list(),
      this.news.list(),
    ]);
    const newsVersion = createHash('sha256')
      .update(JSON.stringify(news))
      .digest('hex')
      .slice(0, NEWS_VERSION_LENGTH);
    return { games, categories, thumbnails, features, newsVersion };
  }
}
