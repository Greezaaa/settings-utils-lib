import { UnauthorizedException } from '@nestjs/common';
import type { Player } from './player.entity.js';
import { MyResult, ResultsService } from './results.service.js';

export interface Account {
  readonly loginName: string;
  readonly screenName: string;
  readonly email: string | null;
  readonly showOnLeaderboard: boolean;
  readonly nameApproved: boolean;
  readonly favorites: string[];
  readonly results: MyResult[];
}

export async function accountView(
  {
    id,
    loginName,
    screenName,
    email,
    showOnLeaderboard,
    nameApproved,
    favorites,
  }: Player,
  results: ResultsService,
): Promise<Account> {
  return {
    loginName,
    screenName,
    email,
    showOnLeaderboard,
    nameApproved,
    favorites,
    results: await results.mine(id),
  };
}

export const FEW_PER_15_MINUTES = { default: { limit: 5, ttl: 15 * 60_000 } };
export const FEW_PER_HOUR = { default: { limit: 5, ttl: 3_600_000 } };

export function playerOf({ player }: { player?: Player }): Player {
  if (!player) {
    throw new UnauthorizedException();
  }
  return player;
}
