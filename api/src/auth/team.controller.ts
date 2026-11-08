import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import { SuperAdminGuard } from '../security/admin.guard.js';
import { MEMBER_ROLES } from './admin.entity.js';
import { MIN_PASSWORD_LENGTH } from './passwords.js';
import { Invite, TeamMember, TeamService } from './team.service.js';

const roleSchema = z.enum(MEMBER_ROLES);
const addSchema = z.object({
  email: z.email().max(254),
  role: roleSchema.default('moderator'),
  /** A starting password to hand over; without one, an invite link is made instead */
  password: z.string().min(MIN_PASSWORD_LENGTH).max(200).optional(),
});
type AddInput = z.infer<typeof addSchema>;
/** Turn a member on or off, or change their role */
const changeSchema = z.object({
  active: z.boolean().optional(),
  role: roleSchema.optional(),
});
type ChangeInput = z.infer<typeof changeSchema>;
const idSchema = z.uuid();

/** For the super admin: the team of moderators and testers, their roles, invites, and turning them on or off */
@Controller('admin/team')
@UseGuards(SuperAdminGuard)
export class TeamController {
  constructor(private readonly team: TeamService) {}

  @Get()
  list(): Promise<TeamMember[]> {
    return this.team.list();
  }

  @Post()
  add(
    @Body({ schema: addSchema }) { email, role, password }: AddInput,
  ): Promise<{ member: TeamMember; invite: Invite | null }> {
    return this.team.addMember(email, role, password);
  }

  /** A new invite link, e.g. when the first one expired or the moderator forgot their password */
  @Post(':id/invite')
  reinvite(@Param('id', { schema: idSchema }) id: string): Promise<Invite> {
    return this.team.reinvite(id);
  }

  @Patch(':id')
  @HttpCode(204)
  async change(
    @Param('id', { schema: idSchema }) id: string,
    @Body({ schema: changeSchema }) { active, role }: ChangeInput,
  ): Promise<void> {
    if (role) {
      await this.team.setRole(id, role);
    }
    if (active !== undefined) {
      await this.team.setActive(id, active);
    }
  }
}
