import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** One 👍 or 👎 for a game, with an optional preset reason; anonymous, dated by day only */
@Entity('feedback')
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 40 })
  game: string;

  @Column({ type: 'varchar', length: 4 })
  vote: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  reason: string | null;

  @Column({ type: 'varchar', length: 2 })
  language: string;

  @Column({ type: 'date' })
  day: string;
}
