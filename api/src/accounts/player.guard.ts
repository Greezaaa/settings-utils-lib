import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { readCookie } from '../auth/session-cookie.js';
import { API_APP, AppId, isAppId, playerCookie } from '../shared/apps.js';
import { AccountsService } from './accounts.service.js';
import type { Player } from './player.entity.js';

/** A request from a signed-in player, with their account */
export type PlayerRequest = Request & { player?: Player };

/**
 * The app a request is for: the `:app` in an auth.su-labs.dev path, else the app api.su-labs.dev serves. An unknown app
 * never gets this far, as the path's own check refuses it first.
 */
export const appOf = (request: Request): AppId => {
  const app: unknown = request.params['app'];
  return isAppId(app) ? app : API_APP;
};

/** Lets a request through only for a player signed in to their account in the request's app (that app's cookie) */
@Injectable()
export class PlayerGuard implements CanActivate {
  constructor(private readonly accounts: AccountsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<PlayerRequest>();
    const app = appOf(request);
    const token = readCookie(request, playerCookie(app));
    const player = token ? await this.accounts.playerForToken(app, token) : null;
    if (!player) {
      throw new UnauthorizedException();
    }
    request.player = player;
    return true;
  }
}
