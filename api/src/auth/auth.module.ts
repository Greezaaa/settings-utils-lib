import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminGuard, SuperAdminGuard } from '../security/admin.guard.js';
import { AdminSession } from './admin-session.entity.js';
import { Admin } from './admin.entity.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { TeamController } from './team.controller.js';
import { TeamService } from './team.service.js';

/** Admin accounts, sessions and the team; global, so every module's admin endpoints can use the admin guards */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Admin, AdminSession])],
  controllers: [AuthController, TeamController],
  providers: [AuthService, TeamService, AdminGuard, SuperAdminGuard],
  exports: [AuthService, TeamService, AdminGuard, SuperAdminGuard],
})
export class AuthModule {}
