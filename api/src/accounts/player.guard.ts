import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { readCookie } from '../auth/session-cookie.js';
import { API_APP, AppId, isAppId, playerCookie } from '../shared/apps.js';
import { AccountsService } from './accounts.service.js';
import type { Player } from './player.entity.js';

export type PlayerRequest = Request & { player?: Player };

export const appOf = (request: Request): AppId => {
  const app: unknown = request.params['app'];
  return isAppId(app) ? app : API_APP;
};

@Injectable()
export class PlayerGuard implements CanActivate {
  constructor(private readonly accounts: AccountsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<PlayerRequest>();
    const app = appOf(request);
    const token = readCookie(request, playerCookie(app));
    const player = token
      ? await this.accounts.playerForToken(app, token)
      : null;
    if (!player) {
      throw new UnauthorizedException();
    }
    request.player = player;
    return true;
  }
}
