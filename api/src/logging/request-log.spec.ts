import { loggedPath, requestLine } from './request-log.js';

describe('request log', () => {
  it('keeps the path, without its query or any secret', () => {
    expect(loggedPath('/v1/games?x=1')).toBe('/v1/games');
    expect(loggedPath('/auth/invite/abcdefghijklmnopqrstuvwx')).toBe(
      '/auth/invite/***',
    );
    expect(loggedPath('/v1/account/reset/abcdefghijklmnopqrstuvwx')).toBe(
      '/v1/account/reset/***',
    );
    expect(loggedPath('/admin/errors/42')).toBe('/admin/errors/42');
  });

  it('writes one short line per request', () => {
    expect(requestLine('POST', '/auth/login', 401, 119.6)).toBe(
      'POST /auth/login 401 120ms',
    );
  });
});
