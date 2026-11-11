import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminGuard, SuperAdminGuard } from '../security/admin.guard.js';
import { AdminSession } from './admin-session.entity.js';
import { Admin } from './admin.entity.js';
import { AuthService } from './auth.service.js';
import { TeamService } from './team.service.js';

/**
 * Admin accounts, sessions and the team; global, so every module's admin endpoints can use the admin guards. Its
 * endpoints (signing in, the team) are on auth.su-labs.dev: see SignInModule.
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Admin, AdminSession])],
  providers: [AuthService, TeamService, AdminGuard, SuperAdminGuard],
  exports: [AuthService, TeamService, AdminGuard, SuperAdminGuard],
})
export class AuthModule {}
