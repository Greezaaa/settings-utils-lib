import { Module } from '@nestjs/common';
import { FeatureFlagsModule } from '../feature-flags/feature-flags.module.js';
import { AccountsController, LeaderboardController, PlayersAdminController } from './accounts.controller.js';
import { AccountsModule } from './accounts.module.js';

/** The account's data (favourites, results, screen name), the leaderboards and their moderation, on api.su-labs.dev */
@Module({
  imports: [AccountsModule, FeatureFlagsModule],
  controllers: [
    AccountsController,
    LeaderboardController,
    PlayersAdminController,
  ],
})
export class AccountsApiModule {}
