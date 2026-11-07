import { createHash, timingSafeEqual } from 'node:crypto';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import type { Env } from '../config/env.js';

const digest = (value: string): Buffer =>
  createHash('sha256').update(value).digest();

/** Lets a request through only with `Authorization: Bearer <ADMIN_TOKEN>`; for the moderation endpoints */
@Injectable()
export class AdminTokenGuard implements CanActivate {
  private readonly expected: Buffer;

  constructor(config: ConfigService<Env, true>) {
    this.expected = digest(config.get('ADMIN_TOKEN', { infer: true }));
  }

  canActivate(context: ExecutionContext): boolean {
    const header =
      context.switchToHttp().getRequest<Request>().headers.authorization ?? '';
    const token = header.startsWith('Bearer ')
      ? header.slice('Bearer '.length)
      : '';
    // Compare digests in constant time, so the response time says nothing about the token
    if (!token || !timingSafeEqual(digest(token), this.expected)) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
