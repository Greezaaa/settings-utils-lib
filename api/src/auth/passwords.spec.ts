import { hashPassword, hashToken, newSessionToken, randomPassword, verifyPassword } from './passwords.js';

describe('passwords', () => {
  it('verifies the right password only, and never stores it', async () => {
    const stored = await hashPassword('correct horse battery');
    expect(stored).not.toContain('correct');
    expect(await verifyPassword('correct horse battery', stored)).toBe(true);
    expect(await verifyPassword('wrong password', stored)).toBe(false);
    expect(await verifyPassword('anything', 'not-a-hash')).toBe(false);
  });

  it('salts every hash', async () => {
    expect(await hashPassword('same password')).not.toBe(
      await hashPassword('same password'),
    );
  });

  it('makes random session tokens and keeps only their hash', () => {
    const { token, hash } = newSessionToken();
    expect(token).not.toBe(newSessionToken().token);
    expect(hash).toBe(hashToken(token));
    expect(hash).toHaveLength(64);
    expect(randomPassword().length).toBeGreaterThanOrEqual(16);
  });
});
