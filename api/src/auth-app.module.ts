import { Module } from '@nestjs/common';
import { SignInModule } from './auth/sign-in.module.js';
import { CoreModule } from './core.module.js';

@Module({
  imports: [CoreModule.forRoot({ runMigrations: false }), SignInModule],
})
export class AuthAppModule {}
