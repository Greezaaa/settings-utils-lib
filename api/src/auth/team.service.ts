import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin, AdminRole, MemberRole } from './admin.entity.js';
import { AuthService, normalizeEmail } from './auth.service.js';
import { hashPassword, newSessionToken, randomPassword } from './passwords.js';

export const INVITE_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface TeamMember {
  readonly id: string;
  readonly email: string;
  readonly role: AdminRole;
  readonly active: boolean;
  readonly invited: boolean;
  readonly created: Date;
}

export interface Invite {
  readonly secret: string;
  readonly expires: Date;
}

const toMember = ({
  id,
  email,
  role,
  active,
  passwordHash,
  created,
}: Admin): TeamMember => ({
  id,
  email,
  role,
  active,
  invited: passwordHash === null,
  created,
});

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Admin) private readonly admins: Repository<Admin>,
    private readonly auth: AuthService,
  ) {}

  async list(): Promise<TeamMember[]> {
    const admins = await this.admins.find({
      order: { role: 'DESC', created: 'ASC' },
    });
    return admins.map(toMember);
  }

  async addMember(
    email: string,
    role: MemberRole,
    password?: string,
  ): Promise<{ member: TeamMember; invite: Invite | null }> {
    const normalized = normalizeEmail(email);
    if (await this.admins.existsBy({ email: normalized })) {
      throw new ConflictException(
        'Someone with that email is already on the team',
      );
    }
    const invite = password ? null : newInvite();
    await this.admins.insert({
      email: normalized,
      role,
      passwordHash: password ? await hashPassword(password) : null,
      inviteHash: invite?.hash ?? null,
      inviteExpires: invite?.expires ?? null,
    });
    const admin = await this.admins.findOneByOrFail({ email: normalized });
    return {
      member: toMember(admin),
      invite: invite && { secret: invite.secret, expires: invite.expires },
    };
  }

  async reinvite(id: string): Promise<Invite> {
    const admin = await this.member(id);
    const invite = newInvite();
    await this.admins.update(
      { id: admin.id },
      { inviteHash: invite.hash, inviteExpires: invite.expires },
    );
    return { secret: invite.secret, expires: invite.expires };
  }

  async setActive(id: string, active: boolean): Promise<void> {
    const admin = await this.member(id);
    await this.admins.update({ id: admin.id }, { active });
    if (!active) {
      await this.auth.signOutEverywhere(admin.id);
    }
  }

  async setRole(id: string, role: MemberRole): Promise<void> {
    const admin = await this.member(id);
    await this.admins.update({ id: admin.id }, { role });
  }

  async createSuperAdmin(email: string): Promise<string> {
    const normalized = normalizeEmail(email);
    const password = randomPassword();
    const passwordHash = await hashPassword(password);
    const existing = await this.admins.findOneBy({ email: normalized });
    if (existing) {
      await this.admins.update(
        { id: existing.id },
        {
          passwordHash,
          role: 'super',
          active: true,
          failedLogins: 0,
          lockedUntil: null,
        },
      );
      await this.auth.signOutEverywhere(existing.id);
    } else {
      await this.admins.insert({
        email: normalized,
        passwordHash,
        role: 'super',
      });
    }
    return password;
  }

  private async member(id: string): Promise<Admin> {
    const admin = await this.admins.findOneBy({ id });
    if (!admin) {
      throw new NotFoundException();
    }
    if (admin.role === 'super') {
      throw new ForbiddenException('The super admin is managed on the server');
    }
    return admin;
  }
}

function newInvite(now = new Date()): {
  secret: string;
  hash: string;
  expires: Date;
} {
  const { token, hash } = newSessionToken();
  return {
    secret: token,
    hash,
    expires: new Date(now.getTime() + INVITE_DAYS * DAY_MS),
  };
}
