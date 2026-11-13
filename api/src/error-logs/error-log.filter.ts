import { ArgumentsHost, Catch, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';
import type { Request } from 'express';
import { ErrorLogsService } from './error-logs.service.js';

@Catch()
export class ErrorLogFilter extends BaseExceptionFilter {
  constructor(
    adapterHost: HttpAdapterHost,
    private readonly errors: ErrorLogsService,
  ) {
    super(adapterHost.httpAdapter);
  }

  override catch(exception: unknown, host: ArgumentsHost): void {
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    if (status >= 500 && host.getType() === 'http') {
      const request = host.switchToHttp().getRequest<Request>();
      void this.errors.add({
        source: 'api',
        code: String(status),
        title: exception instanceof Error ? exception.name : 'Error',
        problem:
          exception instanceof Error ? exception.message : String(exception),
        path: `${request.method} ${request.path}`,
      });
    }
    super.catch(exception, host);
  }
}
