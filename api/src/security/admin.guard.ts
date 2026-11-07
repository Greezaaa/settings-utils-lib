import { createHash, timingSafeEqual } from 'node:crypto';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import type { Admin } from '../auth/admin.entity.js';
import { AuthService } from '../auth/auth.service.js';
import { sessionToken } from '../auth/session-cookie.js';
import type { Env } from '../config/env.js';

const digest = (value: string): Buffer =>
  createHash('sha256').update(value).digest();

/** A request let through by the admin guards: the signed-in admin, or null when it came with the backup token */
export type AdminRequest = Request & { admin?: Admin | null };

/**
 * Lets a request through for the admin team only: a browser signed in with email and password (the session cookie),
 * or a script with the backup key, `Authorization: Bearer <ADMIN_TOKEN>`. For the moderation endpoints.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  private readonly expected: Buffer;

  constructor(
    config: ConfigService<Env, true>,
    private readonly auth: AuthService,
  ) {
    this.expected = digest(config.get('ADMIN_TOKEN', { infer: true }));
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AdminRequest>();
    const header = request.headers.authorization ?? '';
    const bearer = header.startsWith('Bearer ')
      ? header.slice('Bearer '.length)
      : '';
    // Compare digests in constant time, so the response time says nothing about the token
    if (bearer && timingSafeEqual(digest(bearer), this.expected)) {
      request.admin = null;
      return true;
    }
    const token = sessionToken(request);
    const admin = token ? await this.auth.adminForToken(token) : null;
    if (!admin) {
      throw new UnauthorizedException();
    }
    request.admin = admin;
    return true;
  }
}

/** Like AdminGuard, but only for the super admin (or the backup token): managing the team */
@Injectable()
export class SuperAdminGuard extends AdminGuard {
  override async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);
    const { admin } = context.switchToHttp().getRequest<AdminRequest>();
    if (admin && admin.role !== 'super') {
      throw new ForbiddenException();
    }
    return true;
  }
}
