import { Module } from '@nestjs/common';
import { AccountsApiModule } from './accounts/accounts-api.module.js';
import { ErrorLogsModule } from './error-logs/error-logs.module.js';
import { FeatureFlagsModule } from './feature-flags/feature-flags.module.js';
import { FeedbackModule } from './feedback/feedback.module.js';
import { GameSettingsModule } from './game-settings/game-settings.module.js';
import { PlaysModule } from './plays/plays.module.js';
import { StatsModule } from './stats/stats.module.js';
import { SuggestionsModule } from './suggestions/suggestions.module.js';
import { WordReportsModule } from './word-reports/word-reports.module.js';

/** The endpoints of api.su-labs.dev; signing in and out is on auth.su-labs.dev (SignInModule) */
@Module({
  imports: [
    AccountsApiModule,
    ErrorLogsModule,
    PlaysModule,
    StatsModule,
    FeedbackModule,
    FeatureFlagsModule,
    GameSettingsModule,
    WordReportsModule,
    SuggestionsModule,
  ],
})
export class ApiModule {}
