import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';

/** Set by Cloudflare on every request through the tunnel: the visitor's address */
const CLOUDFLARE_IP_HEADER = 'cf-connecting-ip';

/** The visitor's address: Cloudflare's header when trusted (behind the tunnel), otherwise the connection's */
export function visitorAddress(
  request: Request,
  trustCloudflare: boolean,
): string {
  const cloudflareIp = request.headers[CLOUDFLARE_IP_HEADER];
  if (trustCloudflare && typeof cloudflareIp === 'string') {
    return cloudflareIp;
  }
  return request.ip ?? 'unknown';
}

/**
 * Rate limits per visitor. Behind the Cloudflare Tunnel every request comes from the tunnel, so the visitor is told
 * apart by Cloudflare's header (when TRUST_CLOUDFLARE is on). Addresses stay in memory for the limit's window only
 * and are never written anywhere.
 */
@Injectable()
export class VisitorThrottlerGuard extends ThrottlerGuard {
  static trustCloudflare = false;

  protected override async getTracker(request: Request): Promise<string> {
    return visitorAddress(request, VisitorThrottlerGuard.trustCloudflare);
  }
}
