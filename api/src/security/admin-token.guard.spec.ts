import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host.js';
import type { Env } from '../config/env.js';
import { AdminTokenGuard } from './admin-token.guard.js';

const TOKEN = 'a'.repeat(40);

/** An HTTP request context with only an Authorization header */
const contextWith = (authorization?: string): ExecutionContextHost =>
  new ExecutionContextHost([{ headers: { authorization } }]);

describe('AdminTokenGuard', () => {
  const guard = new AdminTokenGuard(
    new ConfigService<Env, true>({ ADMIN_TOKEN: TOKEN }),
  );

  it('lets the right token through', () => {
    expect(guard.canActivate(contextWith(`Bearer ${TOKEN}`))).toBe(true);
  });

  it('refuses a wrong or missing token', () => {
    expect(() => guard.canActivate(contextWith('Bearer wrong'))).toThrow(
      UnauthorizedException,
    );
    expect(() => guard.canActivate(contextWith(TOKEN))).toThrow(
      UnauthorizedException,
    );
    expect(() => guard.canActivate(contextWith())).toThrow(
      UnauthorizedException,
    );
  });
});
