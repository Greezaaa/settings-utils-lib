import { Module } from '@nestjs/common';
import { AccountsModule } from '../accounts/accounts.module.js';
import { PlayerSignInController } from '../accounts/player-sign-in.controller.js';
import { AuthController } from './auth.controller.js';
import { TeamController } from './team.controller.js';

@Module({
  imports: [AccountsModule],
  controllers: [AuthController, TeamController, PlayerSignInController],
})
export class SignInModule {}
