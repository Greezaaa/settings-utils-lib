import { UnauthorizedException } from '@nestjs/common';
import type { Player } from './player.entity.js';
import { MyResult, ResultsService } from './results.service.js';

/** The account as the games site sees it; the login name and email are only ever sent to their owner */
export interface Account {
  readonly loginName: string;
  readonly screenName: string;
  readonly email: string | null;
  /** Whether the player appears on the leaderboards */
  readonly showOnLeaderboard: boolean;
  /** Whether a moderator approved the screen name, so it may show in rooms */
  readonly nameApproved: boolean;
  readonly favorites: string[];
  readonly results: MyResult[];
}

/** A player's account with their results, as both auth.su-labs.dev and api.su-labs.dev answer it */
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

/** Sign-ups, sign-ins and account changes are rare: a few tries every 15 minutes or hour per visitor */
export const FEW_PER_15_MINUTES = { default: { limit: 5, ttl: 15 * 60_000 } };
export const FEW_PER_HOUR = { default: { limit: 5, ttl: 3_600_000 } };

/** The signed-in player PlayerGuard found */
export function playerOf({ player }: { player?: Player }): Player {
  if (!player) {
    throw new UnauthorizedException();
  }
  return player;
}
