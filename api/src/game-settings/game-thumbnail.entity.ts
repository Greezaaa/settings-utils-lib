import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('game_thumbnails')
export class GameThumbnail {
  @PrimaryColumn({ type: 'varchar', length: 40 })
  game: string;

  @Column({ type: 'timestamptz' })
  updated: Date;
}
