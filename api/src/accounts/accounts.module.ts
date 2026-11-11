import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeatureFlagsModule } from '../feature-flags/feature-flags.module.js';
import {
  AccountsController,
  LeaderboardController,
} from './accounts.controller.js';
import { AccountsService } from './accounts.service.js';
import { Mailer } from './mailer.js';
import { PlayerResult } from './player-result.entity.js';
import { PlayerSession } from './player-session.entity.js';
import { Player } from './player.entity.js';
import { PlayerGuard } from './player.guard.js';
import { ResultsService } from './results.service.js';

/** Player accounts, their results and the leaderboards */
@Module({
  imports: [
    TypeOrmModule.forFeature([Player, PlayerSession, PlayerResult]),
    FeatureFlagsModule,
  ],
  controllers: [AccountsController, LeaderboardController],
  providers: [AccountsService, ResultsService, Mailer, PlayerGuard],
})
export class AccountsModule {}
