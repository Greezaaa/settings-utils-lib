import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('player_results')
export class PlayerResult {
  @PrimaryColumn({ type: 'uuid', name: 'player_id' })
  playerId: string;

  @PrimaryColumn({ type: 'varchar', length: 40 })
  game: string;

  @PrimaryColumn({ type: 'varchar', length: 60 })
  key: string;

  @Column({ type: 'integer', default: 0 })
  plays: number;

  @Column({ type: 'integer' })
  best: number;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated: Date;
}
