import { Module } from '@nestjs/common';
import { FeatureFlagsModule } from '../feature-flags/feature-flags.module.js';
import {
  AccountsController,
  LeaderboardController,
} from './accounts.controller.js';
import { AccountsModule } from './accounts.module.js';

/** The account's data (favourites, results, screen name) and the leaderboards, on api.su-labs.dev */
@Module({
  imports: [AccountsModule, FeatureFlagsModule],
  controllers: [AccountsController, LeaderboardController],
})
export class AccountsApiModule {}
