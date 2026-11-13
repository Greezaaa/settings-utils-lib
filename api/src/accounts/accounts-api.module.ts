import { Module } from '@nestjs/common';
import { FeatureFlagsModule } from '../feature-flags/feature-flags.module.js';
import { AccountsController, LeaderboardController, NameReportsController, PlayersAdminController } from './accounts.controller.js';
import { AccountsModule } from './accounts.module.js';

@Module({
  imports: [AccountsModule, FeatureFlagsModule],
  controllers: [
    AccountsController,
    LeaderboardController,
    NameReportsController,
    PlayersAdminController,
  ],
})
export class AccountsApiModule {}
