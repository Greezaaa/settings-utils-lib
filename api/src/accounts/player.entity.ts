import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import type { AppId } from '../shared/apps.js';

/**
 * A player's account in one app (the games site so far): a private login name and password, a public screen name for
 * the leaderboard, optionally an email (only to reset a forgotten password), and whether they appear on the
 * leaderboards. Holds the player's favourites; their results are in player_results. Names and emails are unique within
 * the app.
 */
@Entity('players')
@Unique('players_app_login_name', ['app', 'loginName'])
@Unique('players_app_screen_name', ['app', 'screenNameKey'])
@Unique('players_app_email', ['app', 'email'])
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** The app the account belongs to */
  @Column({ type: 'varchar', length: 20 })
  app: AppId;

  /** Their sign-in, lowercase; never shown to anyone */
  @Column({ type: 'varchar', length: 30, name: 'login_name' })
  loginName: string;

  /** The name the leaderboard shows, as they typed it */
  @Column({ type: 'varchar', length: 20, name: 'screen_name' })
  screenName: string;

  /** The screen name lowercase, so two players can't take names that only differ in capitals */
  @Column({ type: 'varchar', length: 20, name: 'screen_name_key' })
  screenNameKey: string;

  /** scrypt hash with its salt (see auth/passwords.ts) */
  @Column({ type: 'text', name: 'password_hash' })
  passwordHash: string;

  /** Only to reset a forgotten password; lowercase */
  @Column({ type: 'varchar', length: 254, nullable: true })
  email: string | null;

  /** SHA-256 of an open password-reset link's secret, and when it stops working */
  @Column({ type: 'char', length: 64, name: 'reset_hash', nullable: true })
  resetHash: string | null;

  @Column({ type: 'timestamptz', name: 'reset_expires', nullable: true })
  resetExpires: Date | null;

  @Column({ type: 'integer', name: 'failed_logins', default: 0 })
  failedLogins: number;

  @Column({ type: 'timestamptz', name: 'locked_until', nullable: true })
  lockedUntil: Date | null;

  /** Whether the player appears on the leaderboards; off until they choose it */
  @Column({ type: 'boolean', name: 'show_on_leaderboard', default: false })
  showOnLeaderboard: boolean;

  /** Taken off the leaderboards by a moderator (e.g. a rude name or made-up scores); the player can't undo it */
  @Column({ type: 'boolean', name: 'removed_from_boards', default: false })
  removedFromBoards: boolean;

  /**
   * Whether a moderator approved the screen name, so it may show in rooms (where hosts can turn players' own names
   * on). Every new or changed name waits; a report from another player sends it back to wait.
   */
  @Column({ type: 'boolean', name: 'name_approved', default: false })
  nameApproved: boolean;

  /** How many times players reported the name as rude, to put those first for the moderators */
  @Column({ type: 'integer', name: 'name_reports', default: 0 })
  nameReports: number;

  /** Favourite games, most recent first */
  @Column({ type: 'varchar', length: 40, array: true, default: () => "'{}'" })
  favorites: string[];

  @CreateDateColumn({ type: 'timestamptz' })
  created: Date;
}
