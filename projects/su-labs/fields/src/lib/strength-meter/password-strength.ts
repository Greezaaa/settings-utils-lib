/** How strong a new password looks, one step per bar of the meter */
export const SU_STRENGTH_LEVELS = ['weak', 'fair', 'good', 'strong'] as const;
export type SuStrengthLevel = (typeof SU_STRENGTH_LEVELS)[number];

/** Shortest password the meter counts as more than weak, unless told otherwise */
export const SU_DEFAULT_MIN_PASSWORD_LENGTH = 8;

/**
 * Bars of the strength meter a password fills, from 0 (empty) to 4. Under the minimum length it stays at one bar,
 * whatever else it has. Then one bar each for: four characters past the minimum, letters with digits, and symbols or
 * mixed case.
 */
export function suPasswordStrength(
  password: string,
  minLength = SU_DEFAULT_MIN_PASSWORD_LENGTH
): number {
  if (password.length === 0) {
    return 0;
  }
  if (password.length < minLength) {
    return 1;
  }
  const extras = [
    password.length >= minLength + 4,
    /\p{L}/u.test(password) && /\d/.test(password),
    /[^\p{L}\d]/u.test(password) ||
      (/\p{Lu}/u.test(password) && /\p{Ll}/u.test(password)),
  ].filter(Boolean).length;
  return 1 + extras;
}

/** The meter's word for a number of bars, or null for an empty password */
export const suStrengthLevel = (bars: number): SuStrengthLevel | null =>
  SU_STRENGTH_LEVELS[bars - 1] ?? null;
