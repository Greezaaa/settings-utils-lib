import { Column, Entity, PrimaryColumn } from 'typeorm';

/** A signed-in browser; the cookie holds a random token and only its SHA-256 hash is stored here */
@Entity('admin_sessions')
export class AdminSession {
  @PrimaryColumn({ type: 'char', length: 64, name: 'token_hash' })
  tokenHash: string;

  @Column({ type: 'uuid', name: 'admin_id' })
  adminId: string;

  @Column({ type: 'timestamptz' })
  expires: Date;
}
