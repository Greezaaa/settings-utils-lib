import { Module } from '@nestjs/common';
import { SignInModule } from './auth/sign-in.module.js';
import { CoreModule } from './core.module.js';

/**
 * auth.su-labs.dev: signing in and out for the admin team and for players, passwords, invites and the team. It sets
 * the session cookies for all of su-labs.dev (COOKIE_DOMAIN), so api.su-labs.dev knows who is signed in from the same
 * database.
 */
@Module({
  imports: [CoreModule.forRoot({ runMigrations: false }), SignInModule],
})
export class AuthAppModule {}
