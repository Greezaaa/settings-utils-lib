import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import type { AppId } from '../shared/apps.js';

@Entity('players')
@Unique('players_app_login_name', ['app', 'loginName'])
@Unique('players_app_screen_name', ['app', 'screenNameKey'])
@Unique('players_app_email', ['app', 'email'])
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  app: AppId;

  @Column({ type: 'varchar', length: 30, name: 'login_name' })
  loginName: string;

  @Column({ type: 'varchar', length: 20, name: 'screen_name' })
  screenName: string;

  @Column({ type: 'varchar', length: 20, name: 'screen_name_key' })
  screenNameKey: string;

  @Column({ type: 'text', name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 254, nullable: true })
  email: string | null;

  @Column({ type: 'char', length: 64, name: 'reset_hash', nullable: true })
  resetHash: string | null;

  @Column({ type: 'timestamptz', name: 'reset_expires', nullable: true })
  resetExpires: Date | null;

  @Column({ type: 'integer', name: 'failed_logins', default: 0 })
  failedLogins: number;

  @Column({ type: 'timestamptz', name: 'locked_until', nullable: true })
  lockedUntil: Date | null;

  @Column({ type: 'boolean', name: 'show_on_leaderboard', default: false })
  showOnLeaderboard: boolean;

  @Column({ type: 'boolean', name: 'removed_from_boards', default: false })
  removedFromBoards: boolean;

  @Column({ type: 'boolean', name: 'name_approved', default: false })
  nameApproved: boolean;

  @Column({ type: 'integer', name: 'name_reports', default: 0 })
  nameReports: number;

  @Column({ type: 'varchar', length: 40, array: true, default: () => "'{}'" })
  favorites: string[];

  @CreateDateColumn({ type: 'timestamptz' })
  created: Date;
}
