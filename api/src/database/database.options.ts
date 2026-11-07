import type { DataSourceOptions } from 'typeorm';
import { AdminSession } from '../auth/admin-session.entity.js';
import { Admin } from '../auth/admin.entity.js';
import { Feedback } from '../feedback/feedback.entity.js';
import { GameSetting } from '../game-settings/game-setting.entity.js';
import { PlayCount } from '../plays/play-count.entity.js';
import { Suggestion } from '../suggestions/suggestion.entity.js';
import { WordReport } from '../word-reports/word-report.entity.js';
import { Initial1794100000000 } from './migrations/1794100000000-initial.js';
import { GameSettings1794200000000 } from './migrations/1794200000000-game-settings.js';
import { Admins1794300000000 } from './migrations/1794300000000-admins.js';

/**
 * How the API reaches PostgreSQL. The tables are only ever changed by migrations, which run when the API starts;
 * `synchronize` stays off so a code change can never drop data.
 */
export const databaseOptions = (url: string): DataSourceOptions => ({
  type: 'postgres',
  url,
  entities: [
    Admin,
    AdminSession,
    Feedback,
    GameSetting,
    PlayCount,
    Suggestion,
    WordReport,
  ],
  migrations: [
    Initial1794100000000,
    GameSettings1794200000000,
    Admins1794300000000,
  ],
  migrationsRun: true,
  synchronize: false,
});
