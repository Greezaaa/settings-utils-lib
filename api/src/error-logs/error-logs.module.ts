import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ErrorLog } from './error-log.entity.js';
import { ErrorLogFilter } from './error-log.filter.js';
import { ErrorLogsAdminController, ErrorReportsController } from './error-logs.controller.js';
import { ErrorLogsService } from './error-logs.service.js';

/** The error log: the API's own failures (through a global filter) and errors the games site reports */
@Module({
  imports: [TypeOrmModule.forFeature([ErrorLog])],
  controllers: [ErrorReportsController, ErrorLogsAdminController],
  providers: [
    ErrorLogsService,
    { provide: APP_FILTER, useClass: ErrorLogFilter },
  ],
})
export class ErrorLogsModule {}
