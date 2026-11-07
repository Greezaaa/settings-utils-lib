import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { z } from 'zod';
import { AdminGuard } from '../security/admin.guard.js';
import type { LanguageId } from '../shared/catalog.js';
import { languageSchema } from '../shared/catalog.js';
import { WordReport } from './word-report.entity.js';
import type {
  DecisionInput,
  ReportInput,
  ReportStatus,
} from './word-reports.schema.js';
import {
  decisionSchema,
  REPORT_STATUSES,
  reportSchema,
} from './word-reports.schema.js';
import { WordReportsService } from './word-reports.service.js';

/** Players report rude words the word builder accepted; the games site asks which words don't count */
@Controller('v1/word-reports')
export class WordReportsController {
  constructor(private readonly reports: WordReportsService) {}

  @Post()
  @HttpCode(204)
  @Throttle({ default: { limit: 20, ttl: 3_600_000 } })
  async report(
    @Body({ schema: reportSchema }) input: ReportInput,
  ): Promise<void> {
    await this.reports.report(input);
  }

  @Get('hidden')
  async hidden(
    @Query('language', { schema: languageSchema }) language: LanguageId,
  ): Promise<{ words: string[] }> {
    return { words: await this.reports.hidden(language) };
  }
}

/** For moderators: approve a report (the word stays out) or reject it (the word counts again) */
@Controller('admin/word-reports')
@UseGuards(AdminGuard)
export class WordReportsAdminController {
  constructor(private readonly reports: WordReportsService) {}

  @Get()
  list(
    @Query('status', { schema: z.enum(REPORT_STATUSES).default('pending') })
    status: ReportStatus,
  ): Promise<WordReport[]> {
    return this.reports.list(status);
  }

  @Patch(':language/:word')
  @HttpCode(204)
  async decide(
    @Param('language', { schema: languageSchema }) language: LanguageId,
    @Param('word') word: string,
    @Body({ schema: decisionSchema }) decision: DecisionInput,
  ): Promise<void> {
    await this.reports.decide(language, word, decision);
  }
}
