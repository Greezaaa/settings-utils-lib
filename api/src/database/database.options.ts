import type { DataSourceOptions } from 'typeorm';
import { Feedback } from '../feedback/feedback.entity.js';
import { PlayCount } from '../plays/play-count.entity.js';
import { Suggestion } from '../suggestions/suggestion.entity.js';
import { WordReport } from '../word-reports/word-report.entity.js';
import { Initial1794100000000 } from './migrations/1794100000000-initial.js';

/**
 * How the API reaches PostgreSQL. The tables are only ever changed by migrations, which run when the API starts;
 * `synchronize` stays off so a code change can never drop data.
 */
export const databaseOptions = (url: string): DataSourceOptions => ({
  type: 'postgres',
  url,
  entities: [Feedback, PlayCount, Suggestion, WordReport],
  migrations: [Initial1794100000000],
  migrationsRun: true,
  synchronize: false,
});
