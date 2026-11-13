import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export const ADMIN_ROLES = ['super', 'moderator', 'tester'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];
export const MEMBER_ROLES = ['moderator', 'tester'] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];

@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 254, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 10, default: 'moderator' })
  role: AdminRole;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ type: 'text', name: 'password_hash', nullable: true })
  passwordHash: string | null;

  @Column({ type: 'char', length: 64, name: 'invite_hash', nullable: true })
  inviteHash: string | null;

  @Column({ type: 'timestamptz', name: 'invite_expires', nullable: true })
  inviteExpires: Date | null;

  @Column({ type: 'integer', name: 'failed_logins', default: 0 })
  failedLogins: number;

  @Column({ type: 'timestamptz', name: 'locked_until', nullable: true })
  lockedUntil: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created: Date;
}
