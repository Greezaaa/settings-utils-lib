import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('feature_flags')
export class FeatureFlag {
  @PrimaryColumn({ type: 'varchar', length: 40 })
  feature: string;

  @Column({ type: 'boolean' })
  enabled: boolean;

  @Column({ type: 'date' })
  updated: string;
}
