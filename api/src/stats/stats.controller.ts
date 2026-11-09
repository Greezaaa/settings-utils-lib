import { Controller, Delete, HttpCode, UseGuards } from '@nestjs/common';
import { FeedbackService } from '../feedback/feedback.service.js';
import { PlaysService } from '../plays/plays.service.js';
import { SuperAdminGuard } from '../security/admin.guard.js';

/** For the super admin: start the statistics again from today, deleting every play counted and every vote */
@Controller('admin/stats')
@UseGuards(SuperAdminGuard)
export class StatsAdminController {
  constructor(
    private readonly plays: PlaysService,
    private readonly feedback: FeedbackService,
  ) {}

  @Delete()
  @HttpCode(204)
  async reset(): Promise<void> {
    await Promise.all([this.plays.clear(), this.feedback.clear()]);
  }
}
