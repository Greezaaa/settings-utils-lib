import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WordReport } from '../word-reports/word-report.entity.js';
import { AccountsService } from './accounts.service.js';
import { Mailer } from './mailer.js';
import { PlayerResult } from './player-result.entity.js';
import { PlayerSession } from './player-session.entity.js';
import { Player } from './player.entity.js';
import { PlayerGuard } from './player.guard.js';
import { ResultsService } from './results.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Player, PlayerSession, PlayerResult, WordReport]),
  ],
  providers: [AccountsService, ResultsService, Mailer, PlayerGuard],
  exports: [AccountsService, ResultsService, PlayerGuard],
})
export class AccountsModule {}
