import { Module } from '@nestjs/common';
import { ApiModule } from './api.module.js';
import { CoreModule } from './core.module.js';

/**
 * api.su-labs.dev: anonymous play counts, feedback, word reports, suggestions and game switches for games.su-labs.dev,
 * the admin team's moderation, and the data of optional player accounts (favourites, best results, leaderboards).
 * Signing in is on auth.su-labs.dev (AuthAppModule); both share the database and the session cookies. Visitor
 * addresses are only held in memory by the rate limits.
 */
@Module({
  imports: [CoreModule.forRoot({ runMigrations: true }), ApiModule],
})
export class AppModule {}
