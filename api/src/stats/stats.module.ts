import { Module } from '@nestjs/common';
import { FeedbackModule } from '../feedback/feedback.module.js';
import { PlaysModule } from '../plays/plays.module.js';
import { StatsAdminController } from './stats.controller.js';

/** Statistics across modules: resetting plays and votes together */
@Module({
  imports: [PlaysModule, FeedbackModule],
  controllers: [StatsAdminController],
})
export class StatsModule {}
