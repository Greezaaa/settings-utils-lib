import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.js';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
/** How long to wait for Cloudflare's answer before refusing, so a slow check never holds requests open */
const VERIFY_TIMEOUT_MS = 5_000;

/**
 * Checks Cloudflare Turnstile answers, the bot check on the suggestions form. Without a TURNSTILE_SECRET (e.g. in
 * development) every request passes.
 */
@Injectable()
export class TurnstileService {
  private readonly secret: string | undefined;

  constructor(config: ConfigService<Env, true>) {
    this.secret = config.get('TURNSTILE_SECRET', { infer: true });
  }

  async verify(token: string | undefined): Promise<void> {
    if (!this.secret) {
      return;
    }
    if (!token) {
      throw new ForbiddenException('Bot check missing');
    }
    const result = await fetch(VERIFY_URL, {
      method: 'POST',
      body: new URLSearchParams({ secret: this.secret, response: token }),
      signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
    })
      .then((response): Promise<{ success?: boolean }> => response.json())
      .catch(() => ({ success: false }));
    if (!result.success) {
      throw new ForbiddenException('Bot check failed');
    }
  }
}
