import type { Request } from 'express';
import { describe, expect, it } from 'vitest';
import { readCookie, SESSION_COOKIE } from './session-cookie.js';

const requestWith = (cookie: string): Request =>
  ({ headers: { cookie } }) as Request;

describe('readCookie', () => {
  it('reads a cookie among others, decoded', () => {
    expect(
      readCookie(
        requestWith(`other=1; ${SESSION_COOKIE}=a%2Fb`),
        SESSION_COOKIE,
      ),
    ).toBe('a/b');
  });

  it('treats a badly encoded cookie as no cookie instead of throwing', () => {
    expect(
      readCookie(requestWith(`${SESSION_COOKIE}=%E0%A4%A`), SESSION_COOKIE),
    ).toBeNull();
  });

  it('takes the newest of two cookies with the same name (sent last)', () => {
    expect(
      readCookie(
        requestWith(`${SESSION_COOKIE}=old; ${SESSION_COOKIE}=new`),
        SESSION_COOKIE,
      ),
    ).toBe('new');
  });
});
