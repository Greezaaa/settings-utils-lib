import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsService } from './accounts.service.js';
import { Mailer } from './mailer.js';
import { PlayerResult } from './player-result.entity.js';
import { PlayerSession } from './player-session.entity.js';
import { Player } from './player.entity.js';
import { PlayerGuard } from './player.guard.js';
import { ResultsService } from './results.service.js';

/**
 * Player accounts, their sessions and results, for both processes: signing in on auth.su-labs.dev (SignInModule), the
 * account's data and the leaderboards on api.su-labs.dev (AccountsApiModule)
 */
@Module({
  imports: [TypeOrmModule.forFeature([Player, PlayerSession, PlayerResult])],
  providers: [AccountsService, ResultsService, Mailer, PlayerGuard],
  exports: [AccountsService, ResultsService, PlayerGuard],
})
export class AccountsModule {}
