import { validateEnv } from './env.js';

const VALID = {
  DATABASE_URL: 'postgres://user:pass@db:5432/su_labs',
  ADMIN_TOKEN: 'x'.repeat(32),
};

describe('environment', () => {
  it('fills in defaults and reads lists and flags', () => {
    const env = validateEnv({
      ...VALID,
      CORS_ORIGINS: 'https://a.dev, https://b.dev',
      TRUST_CLOUDFLARE: 'true',
    });
    expect(env.PORT).toBe(3000);
    expect(env.CORS_ORIGINS).toEqual(['https://a.dev', 'https://b.dev']);
    expect(env.TRUST_CLOUDFLARE).toBe(true);
    expect(env.TURNSTILE_SECRET).toBeUndefined();
  });

  it('refuses to start without a database or with a short admin token', () => {
    expect(() => validateEnv({ ADMIN_TOKEN: VALID.ADMIN_TOKEN })).toThrow(
      /DATABASE_URL/,
    );
    expect(() => validateEnv({ ...VALID, ADMIN_TOKEN: 'short' })).toThrow(
      /ADMIN_TOKEN/,
    );
  });
});
