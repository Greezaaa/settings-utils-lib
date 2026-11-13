import { createHash, timingSafeEqual } from 'node:crypto';
import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import type { Admin } from '../auth/admin.entity.js';
import { AuthService } from '../auth/auth.service.js';
import { sessionToken } from '../auth/session-cookie.js';
import type { Env } from '../config/env.js';

const digest = (value: string): Buffer =>
  createHash('sha256').update(value).digest();

export type AdminRequest = Request & { admin?: Admin | null };

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
