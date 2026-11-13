import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('player_sessions')
export class PlayerSession {
  @PrimaryColumn({ type: 'char', length: 64, name: 'token_hash' })
  tokenHash: string;

  @Column({ type: 'uuid', name: 'player_id' })
  playerId: string;

  @Column({ type: 'timestamptz' })
  expires: Date;
}
