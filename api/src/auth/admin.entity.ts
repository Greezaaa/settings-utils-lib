import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export const ADMIN_ROLES = ['super', 'moderator', 'tester'] as const;
/**
 * The super admin (only one, created on the server) manages the team and switches games and features. Moderators read
 * suggestions, decide on reported words and read plays and feedback; testers do the same and also see every game and
 * feature in preview, even those switched off for the public.
 */
export type AdminRole = (typeof ADMIN_ROLES)[number];
/** The roles the super admin gives team members */
export const MEMBER_ROLES = ['moderator', 'tester'] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];

/**
 * Someone allowed to use the admin page. The super admin is created on the server (`npm run create-admin`); moderators
 * are added by the super admin, with a starting password or an invite link to choose their own.
 */
@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Their sign-in, always lowercase */
  @Column({ type: 'varchar', length: 254, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 10, default: 'moderator' })
  role: AdminRole;

  /** A deactivated admin can't sign in, and is signed out everywhere */
  @Column({ type: 'boolean', default: true })
  active: boolean;

  /** scrypt hash with its salt (see passwords.ts); null until an invited admin chooses a password */
  @Column({ type: 'text', name: 'password_hash', nullable: true })
  passwordHash: string | null;

  /** SHA-256 of the invite link's secret, while the invite is open */
  @Column({ type: 'char', length: 64, name: 'invite_hash', nullable: true })
  inviteHash: string | null;

  @Column({ type: 'timestamptz', name: 'invite_expires', nullable: true })
  inviteExpires: Date | null;

  /** Failed sign-ins in a row; the account locks for a while after too many */
  @Column({ type: 'integer', name: 'failed_logins', default: 0 })
  failedLogins: number;

  /** Until when the account is locked after too many failed sign-ins */
  @Column({ type: 'timestamptz', name: 'locked_until', nullable: true })
  lockedUntil: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created: Date;
}
