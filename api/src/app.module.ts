import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module.js';
import { Env, validateEnv } from './config/env.js';
import { databaseOptions } from './database/database.options.js';
import { FeedbackModule } from './feedback/feedback.module.js';
import { GameSettingsModule } from './game-settings/game-settings.module.js';
import { HealthController } from './health/health.controller.js';
import { PlaysModule } from './plays/plays.module.js';
import { VisitorThrottlerGuard } from './security/visitor-throttler.guard.js';
import { SuggestionsModule } from './suggestions/suggestions.module.js';
import { WordReportsModule } from './word-reports/word-reports.module.js';

/**
 * api.su-labs.dev: anonymous play counts, feedback, word reports, suggestions and game switches for games.su-labs.dev.
 * No accounts and no personal data: visitor addresses are only held in memory by the rate limits.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) =>
        databaseOptions(config.get('DATABASE_URL', { infer: true })),
    }),
    // Every endpoint: at most 60 requests a minute per visitor; endpoints that write have tighter limits
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    AuthModule,
    PlaysModule,
    FeedbackModule,
    GameSettingsModule,
    WordReportsModule,
    SuggestionsModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: VisitorThrottlerGuard }],
})
export class AppModule {}
