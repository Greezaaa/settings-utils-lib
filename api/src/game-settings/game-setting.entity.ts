import { Column, Entity, PrimaryColumn } from 'typeorm';

/** Whether a game is open to the public; games without a row follow the default in the games site's code */
@Entity('game_settings')
export class GameSetting {
  @PrimaryColumn({ type: 'varchar', length: 40 })
  game: string;

  @Column({ type: 'boolean' })
  enabled: boolean;

  @Column({ type: 'date' })
  updated: string;
}
