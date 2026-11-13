import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminGuard, SuperAdminGuard } from '../security/admin.guard.js';
import { AdminSession } from './admin-session.entity.js';
import { Admin } from './admin.entity.js';
import { AuthService } from './auth.service.js';
import { TeamService } from './team.service.js';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Admin, AdminSession])],
  providers: [AuthService, TeamService, AdminGuard, SuperAdminGuard],
  exports: [AuthService, TeamService, AdminGuard, SuperAdminGuard],
})
export class AuthModule {}
