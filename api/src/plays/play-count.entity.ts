import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('play_counts')
export class PlayCount {
  @PrimaryColumn({ type: 'varchar', length: 40 })
  game: string;

  @PrimaryColumn({ type: 'date' })
  day: string;

  @Column({ type: 'integer', default: 0 })
  count: number;
}
