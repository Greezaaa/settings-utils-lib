import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('suggestions')
export class Suggestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  category: string;

  @Column({ type: 'varchar', length: 500 })
  text: string;

  @Column({ type: 'varchar', length: 2 })
  language: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  image: string | null;

  @Column({ type: 'varchar', length: 10, default: 'new' })
  status: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created: Date;
}
