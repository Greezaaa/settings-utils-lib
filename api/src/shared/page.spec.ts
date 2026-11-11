import { describe, expect, it } from 'vitest';
import { limitSchema, MAX_PAGE_SIZE, offsetSchema, PAGE_SIZE } from './page.js';

describe('page', () => {
  it('starts at the first row with a default page size', () => {
    expect(offsetSchema.parse(undefined)).toBe(0);
    expect(limitSchema.parse(undefined)).toBe(PAGE_SIZE);
  });

  it('reads numbers from the query string', () => {
    expect(offsetSchema.parse('100')).toBe(100);
    expect(limitSchema.parse('20')).toBe(20);
  });

  it('refuses negative offsets and pages that are empty or too big', () => {
    expect(offsetSchema.safeParse('-1').success).toBe(false);
    expect(limitSchema.safeParse('0').success).toBe(false);
    expect(limitSchema.safeParse(String(MAX_PAGE_SIZE + 1)).success).toBe(
      false,
    );
  });
});
