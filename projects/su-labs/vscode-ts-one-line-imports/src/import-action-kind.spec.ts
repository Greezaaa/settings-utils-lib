// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { importActionKind } from './import-action-kind.ts';

describe('importActionKind', () => {
  it('returns nothing when no setting is on', () => {
    expect(importActionKind({ sortImports: false, removeUnusedImports: false })).toBeUndefined();
  });

  it('sorts only', () => {
    expect(importActionKind({ sortImports: true, removeUnusedImports: false })).toBe('source.sortImports');
  });

  it('removes unused imports only', () => {
    expect(importActionKind({ sortImports: false, removeUnusedImports: true })).toBe('source.removeUnusedImports');
  });

  it('organizes imports when both are on', () => {
    expect(importActionKind({ sortImports: true, removeUnusedImports: true })).toBe('source.organizeImports');
  });
});
