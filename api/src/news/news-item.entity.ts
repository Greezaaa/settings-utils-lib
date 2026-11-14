import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type NewsText = Partial<Record<string, string>>;

@Entity('news')
export class NewsItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  version: number;

  @Column({ type: 'timestamptz' })
  published: Date;

  @Column({ type: 'varchar', length: 20 })
  kind: string;

  @Column({ type: 'varchar', length: 40, nullable: true })
  game: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  feature: string | null;

  @Column({ type: 'boolean', default: false })
  privacy: boolean;

  @Column({ type: 'jsonb' })
  text: NewsText;
}
