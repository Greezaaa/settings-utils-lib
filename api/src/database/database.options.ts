import type { DataSourceOptions } from 'typeorm';
import { PlayerResult } from '../accounts/player-result.entity.js';
import { PlayerSession } from '../accounts/player-session.entity.js';
import { Player } from '../accounts/player.entity.js';
import { AdminSession } from '../auth/admin-session.entity.js';
import { ErrorLog } from '../error-logs/error-log.entity.js';
import { Admin } from '../auth/admin.entity.js';
import { FeatureFlag } from '../feature-flags/feature-flag.entity.js';
import { Feedback } from '../feedback/feedback.entity.js';
import { GameCategories } from '../game-settings/game-categories.entity.js';
import { GameSetting } from '../game-settings/game-setting.entity.js';
import { PlayCount } from '../plays/play-count.entity.js';
import { Suggestion } from '../suggestions/suggestion.entity.js';
import { WordReport } from '../word-reports/word-report.entity.js';
import { Initial1794100000000 } from './migrations/1794100000000-initial.js';
import { GameSettings1794200000000 } from './migrations/1794200000000-game-settings.js';
import { Admins1794300000000 } from './migrations/1794300000000-admins.js';
import { FeatureFlags1794400000000 } from './migrations/1794400000000-feature-flags.js';
import { Players1794500000000 } from './migrations/1794500000000-players.js';
import { ErrorLogs1794600000000 } from './migrations/1794600000000-error-logs.js';
import { LeaderboardChoice1794700000000 } from './migrations/1794700000000-leaderboard-choice.js';
import { SignInMoved1794800000000 } from './migrations/1794800000000-sign-in-moved.js';
import { PlayerApps1794900000000 } from './migrations/1794900000000-player-apps.js';
import { BoardModeration1795000000000 } from './migrations/1795000000000-board-moderation.js';
import { NameApproval1795100000000 } from './migrations/1795100000000-name-approval.js';
import { GameCategories1795200000000 } from './migrations/1795200000000-game-categories.js';

export const databaseOptions = (
  url: string,
  runMigrations: boolean,
): DataSourceOptions => ({
  type: 'postgres',
  url,
  entities: [
    Admin,
    AdminSession,
    ErrorLog,
    FeatureFlag,
    Feedback,
    GameCategories,
    GameSetting,
    PlayCount,
    Player,
    PlayerResult,
    PlayerSession,
    Suggestion,
    WordReport,
  ],
  migrations: [
    Initial1794100000000,
    GameSettings1794200000000,
    Admins1794300000000,
    FeatureFlags1794400000000,
    Players1794500000000,
    ErrorLogs1794600000000,
    LeaderboardChoice1794700000000,
    SignInMoved1794800000000,
    PlayerApps1794900000000,
    BoardModeration1795000000000,
    NameApproval1795100000000,
    GameCategories1795200000000,
  ],
  migrationsRun: runMigrations,
  synchronize: false,
});
