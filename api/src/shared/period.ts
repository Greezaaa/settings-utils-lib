import { z } from 'zod';
import { today } from './day.js';

/** Periods the admin page shows statistics for: all time, today, this week (from Monday), this month or this year */
export const STATS_PERIODS = ['day', 'week', 'month', 'year', 'all'] as const;
export type StatsPeriod = (typeof STATS_PERIODS)[number];
export const periodSchema = z.enum(STATS_PERIODS).default('month');

const DAY_MS = 24 * 60 * 60 * 1000;

/** The first day (UTC, `YYYY-MM-DD`) a period counts, or null for all time */
export function periodStart(
  period: StatsPeriod,
  now = new Date(),
): string | null {
  switch (period) {
    case 'all':
      return null;
    case 'day':
      return today(now);
    case 'week': {
      // Days since Monday: getUTCDay() is 0 on Sunday
      const sinceMonday = (now.getUTCDay() + 6) % 7;
      return today(new Date(now.getTime() - sinceMonday * DAY_MS));
    }
    case 'month':
      return `${today(now).slice(0, 7)}-01`;
    case 'year':
      return `${now.getUTCFullYear()}-01-01`;
  }
}
