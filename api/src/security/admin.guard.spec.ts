import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host.js';
import type { Admin } from '../auth/admin.entity.js';
import type { AuthService } from '../auth/auth.service.js';
import { SESSION_COOKIE } from '../auth/session-cookie.js';
import type { Env } from '../config/env.js';
import { AdminGuard, AdminRequest, SuperAdminGuard } from './admin.guard.js';

const TOKEN = 'a'.repeat(40);
const admin = (role: Admin['role']): Admin => ({
  id: role,
  email: `${role}@su-labs.dev`,
  role,
  active: true,
  passwordHash: 'hash',
  inviteHash: null,
  inviteExpires: null,
  failedLogins: 0,
  lockedUntil: null,
  created: new Date(),
});

const auth: Pick<AuthService, 'adminForToken'> = {
  adminForToken: async (token: string) =>
    token === 'super' || token === 'moderator' ? admin(token) : null,
};

const requestWith = (headers: AdminRequest['headers']): AdminRequest =>
  ({ headers }) as AdminRequest;

describe('AdminGuard', () => {
  const guard = new AdminGuard(
    new ConfigService<Env, true>({ ADMIN_TOKEN: TOKEN }),
    auth as AuthService,
  );
  const check = (request: AdminRequest) =>
    guard.canActivate(new ExecutionContextHost([request]));

  it('lets in the backup token', async () => {
    const request = requestWith({ authorization: `Bearer ${TOKEN}` });
    expect(await check(request)).toBe(true);
    expect(request.admin).toBeNull();
  });

  it('lets in a signed-in admin and tells who it is', async () => {
    const request = requestWith({
      cookie: `other=1; ${SESSION_COOKIE}=moderator`,
    });
    expect(await check(request)).toBe(true);
    expect(request.admin?.email).toBe('moderator@su-labs.dev');
  });

  it('refuses everyone else', async () => {
    await expect(
      check(requestWith({ authorization: 'Bearer wrong' })),
    ).rejects.toThrow(UnauthorizedException);
    await expect(
      check(requestWith({ cookie: `${SESSION_COOKIE}=bad` })),
    ).rejects.toThrow(UnauthorizedException);
    await expect(check(requestWith({}))).rejects.toThrow(UnauthorizedException);
  });

  it('keeps team management for the super admin and the backup token', async () => {
    const superGuard = new SuperAdminGuard(
      new ConfigService<Env, true>({ ADMIN_TOKEN: TOKEN }),
      auth as AuthService,
    );
    const checkSuper = (request: AdminRequest) =>
      superGuard.canActivate(new ExecutionContextHost([request]));
    expect(
      await checkSuper(requestWith({ cookie: `${SESSION_COOKIE}=super` })),
    ).toBe(true);
    expect(
      await checkSuper(requestWith({ authorization: `Bearer ${TOKEN}` })),
    ).toBe(true);
    await expect(
      checkSuper(requestWith({ cookie: `${SESSION_COOKIE}=moderator` })),
    ).rejects.toThrow(ForbiddenException);
  });
});
