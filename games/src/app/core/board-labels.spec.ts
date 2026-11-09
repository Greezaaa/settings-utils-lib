import { describe, expect, it } from 'vitest';
import { EN } from '../i18n/en';
import { bestText, boardLabel } from './board-labels';

describe('boardLabel', () => {
  it('names every part of a settings key', () => {
    expect(boardLabel(EN, 'climb-tower', 'which-one:easy')).toBe('Which one? · Easy');
    expect(boardLabel(EN, 'sliding-puzzle', 'hard')).toBe('Hard');
  });

  it('keeps parts it does not know', () => {
    expect(boardLabel(EN, 'climb-tower', 'new-mode:easy:extra')).toBe('new-mode · Easy · extra');
  });
});

describe('bestText', () => {
  it('shows a best as its game does', () => {
    expect(bestText(EN, 'climb-tower', 12)).toBe('Floor 12');
    expect(bestText(EN, 'turn-picture', 65)).toBe('1:05');
    expect(bestText(EN, 'find-pairs', 20)).toBe('Moves 20');
  });
});
