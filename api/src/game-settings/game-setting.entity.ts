import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('game_settings')
export class GameSetting {
  @PrimaryColumn({ type: 'varchar', length: 40 })
  game: string;

  @Column({ type: 'boolean' })
  enabled: boolean;

  @Column({ type: 'date' })
  updated: string;
}
