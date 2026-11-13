import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Not, Repository } from 'typeorm';
import { AdminSession } from './admin-session.entity.js';
import { Admin } from './admin.entity.js';
import { afterFailure, isLocked, UNLOCKED } from '../security/login-lock.js';
import { hashPassword, hashToken, newSessionToken, verifyPassword } from './passwords.js';

export const SESSION_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

const DUMMY_HASH_PROMISE = hashPassword('not a real password');

export interface SignedIn {
  readonly admin: Admin;
  readonly token: string;
  readonly expires: Date;
}

export const normalizeEmail = (email: string): string =>
  email.trim().toLowerCase();

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin) private readonly admins: Repository<Admin>,
    @InjectRepository(AdminSession)
    private readonly sessions: Repository<AdminSession>,
  ) {}

  async signIn(
    email: string,
    password: string,
    now = new Date(),
  ): Promise<SignedIn | null> {
    const admin = await this.admins.findOneBy({ email: normalizeEmail(email) });
    if (!admin?.passwordHash || !admin.active) {
      await verifyPassword(password, await DUMMY_HASH_PROMISE);
      return null;
    }
    if (isLocked(admin, now)) {
      return null;
    }
    if (!(await verifyPassword(password, admin.passwordHash))) {
      await this.admins.update({ id: admin.id }, afterFailure(admin, now));
      return null;
    }
    await this.admins.update({ id: admin.id }, UNLOCKED);
    return this.startSession(admin, now);
  }

  async adminForToken(token: string, now = new Date()): Promise<Admin | null> {
    const session = await this.sessions.findOneBy({
      tokenHash: hashToken(token),
    });
    if (!session || session.expires <= now) {
      return null;
    }
    const admin = await this.admins.findOneBy({ id: session.adminId });
    return admin?.active ? admin : null;
  }

  async signOut(token: string): Promise<void> {
    await this.sessions.delete({ tokenHash: hashToken(token) });
  }

  async changePassword(
    admin: Admin,
    current: string,
    next: string,
    keepToken: string,
  ): Promise<boolean> {
    if (
      !admin.passwordHash ||
      !(await verifyPassword(current, admin.passwordHash))
    ) {
      return false;
    }
    await this.admins.update(
      { id: admin.id },
      { passwordHash: await hashPassword(next) },
    );
    await this.sessions.delete({
      adminId: admin.id,
      tokenHash: Not(hashToken(keepToken)),
    });
    return true;
  }

  async adminForInvite(
    secret: string,
    now = new Date(),
  ): Promise<Admin | null> {
    const admin = await this.admins.findOneBy({
      inviteHash: hashToken(secret),
    });
    return admin?.active && admin.inviteExpires && admin.inviteExpires > now
      ? admin
      : null;
  }

  async acceptInvite(
    secret: string,
    password: string,
    now = new Date(),
  ): Promise<SignedIn | null> {
    const admin = await this.adminForInvite(secret, now);
    if (!admin) {
      return null;
    }
    await this.admins.update(
      { id: admin.id },
      {
        passwordHash: await hashPassword(password),
        inviteHash: null,
        inviteExpires: null,
        failedLogins: 0,
      },
    );
    await this.signOutEverywhere(admin.id);
    return this.startSession(admin, now);
  }

  async signOutEverywhere(adminId: string): Promise<void> {
    await this.sessions.delete({ adminId });
  }

  private async startSession(admin: Admin, now: Date): Promise<SignedIn> {
    await this.sessions.delete({ expires: LessThan(now) });
    const { token, hash } = newSessionToken();
    const expires = new Date(now.getTime() + SESSION_DAYS * DAY_MS);
    await this.sessions.insert({ tokenHash: hash, adminId: admin.id, expires });
    return { admin, token, expires };
  }
}
