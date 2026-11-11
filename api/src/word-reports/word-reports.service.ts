import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LanguageId } from '../shared/catalog.js';
import { today } from '../shared/day.js';
import type { Page } from '../shared/page.js';
import { RecentReports } from './recent-reports.js';
import { WordReport } from './word-report.entity.js';
import {
  DecisionInput,
  ReportInput,
  REPORTS_TO_HIDE,
  ReportStatus,
} from './word-reports.schema.js';

@Injectable()
export class WordReportsService {
  private readonly recent = new RecentReports();

  constructor(
    @InjectRepository(WordReport)
    private readonly reports: Repository<WordReport>,
  ) {}

  /**
   * Counts one more report of a word, once per visitor a day; a word a moderator already decided on keeps that
   * decision
   */
  async report(
    { word, language }: ReportInput,
    visitor: string,
    day = today(),
  ): Promise<void> {
    if (!this.recent.isNew(visitor, language, word)) {
      return;
    }
    await this.reports.query(
      `INSERT INTO word_reports (language, word, reports, "firstReported") VALUES ($1, $2, 1, $3)
       ON CONFLICT (language, word) DO UPDATE SET reports = word_reports.reports + 1`,
      [language, word, day],
    );
  }

  /** Words that don't count in a language: approved by a moderator, or reported often enough and not yet decided */
  async hidden(language: LanguageId): Promise<string[]> {
    const rows = await this.reports
      .createQueryBuilder('report')
      .select('report.word', 'word')
      .where('report.language = :language', { language })
      .andWhere(
        `(report.status = 'approved' OR (report.status = 'pending' AND report.reports >= :reports))`,
        { reports: REPORTS_TO_HIDE },
      )
      .orderBy('report.word')
      .getRawMany<{ word: string }>();
    return rows.map(({ word }) => word);
  }

  /** Reports for moderators, most reported first */
  list(status: ReportStatus, { offset, limit }: Page): Promise<WordReport[]> {
    return this.reports.find({
      where: { status },
      order: { reports: 'DESC', word: 'ASC', language: 'ASC' },
      skip: offset,
      take: limit,
    });
  }

  async decide(
    language: LanguageId,
    word: string,
    { status }: DecisionInput,
    day = today(),
  ): Promise<void> {
    const result = await this.reports.update(
      { language, word },
      { status, decided: day },
    );
    if (!result.affected) {
      throw new NotFoundException();
    }
  }
}
