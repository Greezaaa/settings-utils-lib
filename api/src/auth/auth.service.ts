import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Not, Repository } from 'typeorm';
import { AdminSession } from './admin-session.entity.js';
import { Admin } from './admin.entity.js';
import { afterFailure, isLocked, UNLOCKED } from '../security/login-lock.js';
import {
  hashPassword,
  hashToken,
  newSessionToken,
  verifyPassword,
} from './passwords.js';

/** How long a browser stays signed in */
export const SESSION_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Checked against when the email doesn't exist, so a wrong email takes as long as a wrong password */
const DUMMY_HASH_PROMISE = hashPassword('not a real password');

export interface SignedIn {
  readonly admin: Admin;
  readonly token: string;
  readonly expires: Date;
}

/** Emails are compared lowercase and without spaces around them */
export const normalizeEmail = (email: string): string =>
  email.trim().toLowerCase();

/**
 * Signing in: email and password, sessions kept by a cookie, changing one's password, and accepting an invite.
 * Answers never tell a wrong email from a wrong password, and an account locks for a while after too many failures.
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin) private readonly admins: Repository<Admin>,
    @InjectRepository(AdminSession)
    private readonly sessions: Repository<AdminSession>,
  ) {}

  /** A new session when the email and password are right and the admin is active; null otherwise */
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

  /** The active admin a session cookie belongs to, while it hasn't expired */
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

  /** Changes a password after checking the current one; signs out every other browser of that admin */
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

  /** The admin an open invite link belongs to, or null when it's wrong, used or expired */
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

  /**
   * Accepts an invite: the admin chooses their password, the link stops working, any browser still signed in with
   * the old password is signed out (a new invite is also how a forgotten password is reset), and they are signed in
   */
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

  /** Signs an admin out of every browser, e.g. when they are deactivated */
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
