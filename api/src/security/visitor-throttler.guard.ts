import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';

const CLOUDFLARE_IP_HEADER = 'cf-connecting-ip';

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

@Injectable()
export class VisitorThrottlerGuard extends ThrottlerGuard {
  static trustCloudflare = false;

  protected override async getTracker(request: Request): Promise<string> {
    return visitorAddress(request, VisitorThrottlerGuard.trustCloudflare);
  }
}
