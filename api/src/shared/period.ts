import { z } from 'zod';
import { today } from './day.js';

/** Periods the admin page shows statistics for: all time, today, the last 7 or 30 days, or this year */
export const STATS_PERIODS = ['all', 'day', 'week', 'month', 'year'] as const;
export type StatsPeriod = (typeof STATS_PERIODS)[number];
export const periodSchema = z.enum(STATS_PERIODS).default('month');

const DAY_MS = 24 * 60 * 60 * 1000;
/** Days a period covers, counting today */
const PERIOD_DAYS: Partial<Record<StatsPeriod, number>> = {
  day: 1,
  week: 7,
  month: 30,
};

/** The first day (UTC, `YYYY-MM-DD`) a period counts, or null for all time */
export function periodStart(
  period: StatsPeriod,
  now = new Date(),
): string | null {
  if (period === 'all') {
    return null;
  }
  if (period === 'year') {
    return `${now.getUTCFullYear()}-01-01`;
  }
  const days = PERIOD_DAYS[period] ?? 1;
  return today(new Date(now.getTime() - (days - 1) * DAY_MS));
}
