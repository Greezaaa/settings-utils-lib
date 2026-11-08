import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeatureFlag } from './feature-flag.entity.js';
import {
  FeatureFlagsAdminController,
  FeatureFlagsController,
} from './feature-flags.controller.js';
import { FeatureFlagsService } from './feature-flags.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([FeatureFlag])],
  controllers: [FeatureFlagsController, FeatureFlagsAdminController],
  providers: [FeatureFlagsService],
})
export class FeatureFlagsModule {}
