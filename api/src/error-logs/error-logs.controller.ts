import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { z } from 'zod';
import { SuperAdminGuard } from '../security/admin.guard.js';
import { ErrorLog } from './error-log.entity.js';
import { ErrorLogsService } from './error-logs.service.js';

/** An error a visitor's browser hit on the games site: what went wrong and on which page, nothing about them */
const siteErrorSchema = z.object({
  code: z.string().regex(/^[a-z0-9-]{1,20}$/),
  title: z.string().min(1).max(120),
  problem: z.string().max(1000),
  path: z.string().regex(/^\/[^?#\s]{0,199}$/),
});

/** The games site reports the errors its visitors hit */
@Controller('v1/errors')
export class ErrorReportsController {
  constructor(private readonly errors: ErrorLogsService) {}

  @Post()
  @HttpCode(204)
  @Throttle({ default: { limit: 10, ttl: 3_600_000 } })
  async report(
    @Body({ schema: siteErrorSchema }) error: z.infer<typeof siteErrorSchema>,
  ): Promise<void> {
    await this.errors.add({ source: 'site', ...error });
  }
}

/** For the super admin: the error log, and clearing errors once fixed */
@Controller('admin/errors')
@UseGuards(SuperAdminGuard)
export class ErrorLogsAdminController {
  constructor(private readonly errors: ErrorLogsService) {}

  @Get()
  list(): Promise<ErrorLog[]> {
    return this.errors.list();
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', { schema: z.uuid() }) id: string): Promise<void> {
    await this.errors.remove(id);
  }

  @Delete()
  @HttpCode(204)
  async clear(): Promise<void> {
    await this.errors.clear();
  }
}
