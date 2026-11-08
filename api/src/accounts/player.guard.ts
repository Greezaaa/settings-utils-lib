import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { PLAYER_COOKIE, readCookie } from '../auth/session-cookie.js';
import { AccountsService } from './accounts.service.js';
import type { Player } from './player.entity.js';

/** A request from a signed-in player, with their account */
export type PlayerRequest = Request & { player?: Player };

/** Lets a request through only for a player signed in to their account (the player cookie) */
@Injectable()
export class PlayerGuard implements CanActivate {
  constructor(private readonly accounts: AccountsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<PlayerRequest>();
    const token = readCookie(request, PLAYER_COOKIE);
    const player = token ? await this.accounts.playerForToken(token) : null;
    if (!player) {
      throw new UnauthorizedException();
    }
    request.player = player;
    return true;
  }
}
