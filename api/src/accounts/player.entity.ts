import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * A player's account on the games site: a private login name and password, a public screen name for the leaderboard,
 * and optionally an email (only to reset a forgotten password). Holds the player's favourites; their results are in
 * player_results.
 */
@Entity('players')
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Their sign-in, lowercase; never shown to anyone */
  @Column({ type: 'varchar', length: 30, name: 'login_name', unique: true })
  loginName: string;

  /** The name the leaderboard shows, as they typed it */
  @Column({ type: 'varchar', length: 20, name: 'screen_name' })
  screenName: string;

  /** The screen name lowercase, so two players can't take names that only differ in capitals */
  @Column({
    type: 'varchar',
    length: 20,
    name: 'screen_name_key',
    unique: true,
  })
  screenNameKey: string;

  /** scrypt hash with its salt (see auth/passwords.ts) */
  @Column({ type: 'text', name: 'password_hash' })
  passwordHash: string;

  /** Only to reset a forgotten password; lowercase */
  @Column({ type: 'varchar', length: 254, nullable: true, unique: true })
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

  /** Favourite games, most recent first */
  @Column({ type: 'varchar', length: 40, array: true, default: () => "'{}'" })
  favorites: string[];

  @CreateDateColumn({ type: 'timestamptz' })
  created: Date;
}
