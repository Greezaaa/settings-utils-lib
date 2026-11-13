import { Body, Controller, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AdminGuard } from '../security/admin.guard.js';
import type { StatsPeriod } from '../shared/period.js';
import { periodSchema } from '../shared/period.js';
import type { FeedbackInput } from './feedback.schema.js';
import { feedbackSchema } from './feedback.schema.js';
import { FeedbackService, FeedbackSummary } from './feedback.service.js';

@Controller('v1/feedback')
export class FeedbackController {
  constructor(private readonly feedback: FeedbackService) {}

  @Post()
  @HttpCode(204)
  @Throttle({ default: { limit: 10, ttl: 3_600_000 } })
  async add(
    @Body({ schema: feedbackSchema }) input: FeedbackInput,
  ): Promise<void> {
    await this.feedback.add(input);
  }
}

@Controller('admin/feedback')
@UseGuards(AdminGuard)
export class FeedbackAdminController {
  constructor(private readonly feedback: FeedbackService) {}

  @Get()
  summary(
    @Query('period', { schema: periodSchema }) period: StatsPeriod,
  ): Promise<FeedbackSummary[]> {
    return this.feedback.summary(period);
  }
}
