import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin, AdminRole, MemberRole } from './admin.entity.js';
import { AuthService, normalizeEmail } from './auth.service.js';
import { hashPassword, newSessionToken, randomPassword } from './passwords.js';

/** How long an invite link works */
export const INVITE_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

/** A team member as the admin page shows them; never their password or invite secret */
export interface TeamMember {
  readonly id: string;
  readonly email: string;
  readonly role: AdminRole;
  readonly active: boolean;
  /** Invited and hasn't chosen a password yet */
  readonly invited: boolean;
  readonly created: Date;
}

/** A new invite link's secret (shown once, to copy) and when it stops working */
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

/**
 * The admin team: the super admin (created on the server) adds moderators and testers with a starting password or an
 * invite link,
 * and turns them on or off.
 */
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

  /** Adds a moderator or tester with a starting password, or with an invite link when there is no password */
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

  /** A fresh invite link for a member who hasn't chosen a password yet, or who forgot theirs */
  async reinvite(id: string): Promise<Invite> {
    const admin = await this.member(id);
    const invite = newInvite();
    await this.admins.update(
      { id: admin.id },
      { inviteHash: invite.hash, inviteExpires: invite.expires },
    );
    return { secret: invite.secret, expires: invite.expires };
  }

  /** Turns a member on or off; off signs them out everywhere */
  async setActive(id: string, active: boolean): Promise<void> {
    const admin = await this.member(id);
    await this.admins.update({ id: admin.id }, { active });
    if (!active) {
      await this.auth.signOutEverywhere(admin.id);
    }
  }

  /** Makes a member a moderator or a tester */
  async setRole(id: string, role: MemberRole): Promise<void> {
    const admin = await this.member(id);
    await this.admins.update({ id: admin.id }, { role });
  }

  /**
   * Creates the super admin, or gives an existing account a new random password and makes it super admin; returns that
   * password, shown once. Used by the create-admin command on the server.
   */
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

  /** A team member (moderator or tester) by id; the super admin can't be changed from the admin page */
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
