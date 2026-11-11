import { describe, expect, it } from 'vitest';
import { suPasswordStrength, suStrengthLevel } from './password-strength';

describe('suPasswordStrength', () => {
  it('fills no bar for an empty password and one for a short one', () => {
    expect(suPasswordStrength('')).toBe(0);
    expect(suPasswordStrength('Ab1!')).toBe(1);
  });

  it('adds a bar for length, letters with digits, and symbols or mixed case', () => {
    expect(suPasswordStrength('a'.repeat(10), 10)).toBe(1);
    expect(suPasswordStrength('sunset4242', 10)).toBe(2);
    expect(suPasswordStrength('Sunset4242', 10)).toBe(3);
    expect(suPasswordStrength('Sunset42!? at noon', 10)).toBe(4);
  });

  it('names each step of the meter', () => {
    expect(suStrengthLevel(0)).toBeNull();
    expect(suStrengthLevel(1)).toBe('weak');
    expect(suStrengthLevel(4)).toBe('strong');
  });
});
