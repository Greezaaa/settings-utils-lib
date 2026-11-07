import { Column, Entity, PrimaryColumn } from 'typeorm';

/** How many games were started per game and day; one row per game and day, never one per play */
@Entity('play_counts')
export class PlayCount {
  @PrimaryColumn({ type: 'varchar', length: 40 })
  game: string;

  /** `YYYY-MM-DD`, in UTC */
  @PrimaryColumn({ type: 'date' })
  day: string;

  @Column({ type: 'integer', default: 0 })
  count: number;
}
