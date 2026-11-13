import { ArgumentsHost, BadRequestException, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ErrorLogFilter } from './error-log.filter.js';
import { ErrorEntry, ErrorLogsService } from './error-logs.service.js';

function filterLogging(logged: ErrorEntry[]): ErrorLogFilter {
  const errors: Pick<ErrorLogsService, 'add'> = {
    add: async (entry) => {
      logged.push(entry);
    },
  };
  const adapterHost: Pick<HttpAdapterHost, 'httpAdapter'> = {
    httpAdapter: Object.assign(Object.create(null), {
      reply: vi.fn(),
      isHeadersSent: () => false,
      end: vi.fn(),
    }),
  };
  return new ErrorLogFilter(
    adapterHost as HttpAdapterHost,
    errors as ErrorLogsService,
  );
}

const host = {
  getType: () => 'http',
  getArgs: () => [],
  getArgByIndex: () => undefined,
  switchToHttp: () => ({
    getRequest: () => ({ method: 'GET', path: '/v1/plays' }),
    getResponse: () => ({}),
    getNext: () => undefined,
  }),
  switchToRpc: () => {
    throw new Error('not rpc');
  },
  switchToWs: () => {
    throw new Error('not ws');
  },
} as ArgumentsHost;

describe('ErrorLogFilter', () => {
  beforeAll(() =>
    vi.spyOn(Logger, 'error').mockImplementation(() => undefined),
  );

  it('logs the API’s own failures, not expected answers', () => {
    const logged: ErrorEntry[] = [];
    const filter = filterLogging(logged);
    filter.catch(new TypeError('boom'), host);
    filter.catch(new BadRequestException(), host);
    expect(logged).toEqual([
      {
        source: 'api',
        code: '500',
        title: 'TypeError',
        problem: 'boom',
        path: 'GET /v1/plays',
      },
    ]);
  });
});
