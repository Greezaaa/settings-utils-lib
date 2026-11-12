import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WordReport } from './word-report.entity.js';
import { WordReportsAdminController, WordReportsController } from './word-reports.controller.js';
import { WordReportsService } from './word-reports.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([WordReport])],
  controllers: [WordReportsController, WordReportsAdminController],
  providers: [WordReportsService],
})
export class WordReportsModule {}
