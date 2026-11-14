import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('game_categories')
export class GameCategories {
  @PrimaryColumn({ type: 'varchar', length: 40 })
  game: string;

  @Column({ type: 'text', array: true })
  categories: string[];

  @Column({ type: 'date' })
  updated: string;
}
