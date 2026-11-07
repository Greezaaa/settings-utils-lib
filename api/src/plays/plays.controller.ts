import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { z } from 'zod';
import { gameSchema } from '../shared/catalog.js';
import { GamePlays, PlaysService, POPULAR_DAYS } from './plays.service.js';

const playSchema = z.object({ game: gameSchema });

/** The play counter: the games site reports each game started, and reads the totals for "Most popular" */
@Controller('v1/plays')
export class PlaysController {
  constructor(private readonly plays: PlaysService) {}

  @Post()
  @HttpCode(204)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async count(
    @Body({ schema: playSchema }) { game }: z.infer<typeof playSchema>,
  ): Promise<void> {
    await this.plays.count(game);
  }

  @Get()
  async recent(): Promise<{ days: number; games: GamePlays[] }> {
    return { days: POPULAR_DAYS, games: await this.plays.recent() };
  }
}
