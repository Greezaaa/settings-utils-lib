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
import { MIN_PASSWORD_LENGTH } from './passwords.js';
import { Invite, TeamMember, TeamService } from './team.service.js';

const addSchema = z.object({
  email: z.email().max(254),
  /** A starting password to hand over; without one, an invite link is made instead */
  password: z.string().min(MIN_PASSWORD_LENGTH).max(200).optional(),
});
type AddInput = z.infer<typeof addSchema>;
const activeSchema = z.object({ active: z.boolean() });
type ActiveInput = z.infer<typeof activeSchema>;
const idSchema = z.uuid();

/** For the super admin: the team of moderators, invites, and turning moderators on or off */
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
    @Body({ schema: addSchema }) { email, password }: AddInput,
  ): Promise<{ member: TeamMember; invite: Invite | null }> {
    return this.team.addModerator(email, password);
  }

  /** A new invite link, e.g. when the first one expired or the moderator forgot their password */
  @Post(':id/invite')
  reinvite(@Param('id', { schema: idSchema }) id: string): Promise<Invite> {
    return this.team.reinvite(id);
  }

  @Patch(':id')
  @HttpCode(204)
  async setActive(
    @Param('id', { schema: idSchema }) id: string,
    @Body({ schema: activeSchema }) { active }: ActiveInput,
  ): Promise<void> {
    await this.team.setActive(id, active);
  }
}
