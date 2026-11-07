import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';

/** Set by Cloudflare on every request through the tunnel: the visitor's address */
const CLOUDFLARE_IP_HEADER = 'cf-connecting-ip';

/**
 * Rate limits per visitor. Behind the Cloudflare Tunnel every request comes from the tunnel, so the visitor is told
 * apart by Cloudflare's header (when TRUST_CLOUDFLARE is on). Addresses stay in memory for the limit's window only
 * and are never written anywhere.
 */
@Injectable()
export class VisitorThrottlerGuard extends ThrottlerGuard {
  static trustCloudflare = false;

  protected override async getTracker(request: Request): Promise<string> {
    const cloudflareIp = request.headers[CLOUDFLARE_IP_HEADER];
    if (
      VisitorThrottlerGuard.trustCloudflare &&
      typeof cloudflareIp === 'string'
    ) {
      return cloudflareIp;
    }
    return request.ip ?? 'unknown';
  }
}
