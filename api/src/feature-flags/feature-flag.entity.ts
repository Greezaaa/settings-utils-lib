import { Column, Entity, PrimaryColumn } from 'typeorm';

/** Whether a feature (like rooms) is open to the public; features without a row follow the games site's default */
@Entity('feature_flags')
export class FeatureFlag {
  @PrimaryColumn({ type: 'varchar', length: 40 })
  feature: string;

  @Column({ type: 'boolean' })
  enabled: boolean;

  @Column({ type: 'date' })
  updated: string;
}
