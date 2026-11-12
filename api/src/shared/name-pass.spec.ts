import { describe, expect, it } from 'vitest';
import { NAME_PASS_MS, signNamePass, verifyNamePass } from './name-pass.js';

const SECRET = 's'.repeat(32);

describe('name pass', () => {
  it('gives back the name it was signed with', () => {
    expect(
      verifyNamePass(signNamePass('Lucía', SECRET, 1000), SECRET, 2000),
    ).toBe('Lucía');
  });

  it('refuses a pass that expired, was changed, or was signed with another secret', () => {
    const pass = signNamePass('Lucía', SECRET, 1000);
    expect(verifyNamePass(pass, SECRET, 1000 + NAME_PASS_MS)).toBeNull();
    const [, signed] = pass.split('.');
    const forged = `${Buffer.from(JSON.stringify({ name: 'Rude', expires: 9e15 })).toString('base64url')}.${signed}`;
    expect(verifyNamePass(forged, SECRET, 2000)).toBeNull();
    expect(verifyNamePass(pass, 'x'.repeat(32), 2000)).toBeNull();
    expect(verifyNamePass('not-a-pass', SECRET, 2000)).toBeNull();
  });
});
