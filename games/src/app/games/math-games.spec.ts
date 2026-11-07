import { describe, expect, it } from 'vitest';
import { createQuestion, formatPrompt, formatQuestion, getLevel, isCorrectAnswer, isTrue, LEVELS, Question, secondsForQuestion } from './math-games';
import { Random } from './random';

/** Random source that returns the given values in order, then repeats the last one */
function sequence(...values: number[]): Random {
  let index = 0;
  return () => values[Math.min(index++, values.length - 1)];
}

/** Recomputes a question's result from its operands */
function calculate({ left, operator, right }: Question): number {
  switch (operator) {
    case '+':
      return left + right;
    case '−':
      return left - right;
    case '×':
      return left * right;
    case '÷':
      return left / right;
  }
}

const RUNS = 1000;

describe('math games rules', () => {
  it('formats an equation the way the player reads it', () => {
    const question: Question = { left: 12, operator: '+', right: 34, shown: 46, answer: 46 };
    expect(formatQuestion(question)).toBe('12 + 34 = 46');
  });

  it('shows the real result when the coin lands on true', () => {
    // operation +, operands 10 and 10, coin 0.1 (< 0.5 → true)
    const question = createQuestion(getLevel('normal'), sequence(0, 0, 0, 0.1));
    expect(question).toEqual({ left: 10, operator: '+', right: 10, shown: 20, answer: 20 });
    expect(isTrue(question)).toBe(true);
  });

  it('shows a near miss when the coin lands on false', () => {
    // operation +, operands 10 and 10, coin false, distance 10, goes down
    const question = createQuestion(getLevel('normal'), sequence(0, 0, 0, 0.9, 0.9, 0.1));
    expect(question.shown).toBe(10);
    expect(isTrue(question)).toBe(false);
  });

  it('builds divisions that always come out even', () => {
    // operation ÷ (second of two), quotient 2, divisor 9, coin true
    const question = createQuestion(getLevel('advanced'), sequence(0.9, 0, 0.99, 0.1));
    expect(question).toEqual({ left: 18, operator: '÷', right: 9, shown: 2, answer: 2 });
  });

  it.each(LEVELS.map((level) => [level.id, level] as const))(
    'keeps %s questions correct and within limits',
    (_, level) => {
      const operators = new Set(level.operations.map((operation) => operation.operator));
      for (let run = 0; run < RUNS; run++) {
        const question = createQuestion(level);
        expect(operators).toContain(question.operator);
        expect(question.answer).toBe(calculate(question));
        expect(Number.isInteger(question.answer)).toBe(true);
        expect(question.answer).toBeGreaterThanOrEqual(0);
        expect(question.shown).toBeGreaterThanOrEqual(0);
      }
    },
  );

  it('uses one-digit numbers for advanced', () => {
    for (let run = 0; run < RUNS; run++) {
      const { left, operator, right, answer } = createQuestion(getLevel('advanced'));
      const factors = operator === '÷' ? [right, answer] : [left, right];
      for (const factor of factors) {
        expect(factor).toBeGreaterThanOrEqual(2);
        expect(factor).toBeLessThanOrEqual(9);
      }
    }
  });

  it('uses two- and three-digit numbers for expert', () => {
    for (let run = 0; run < RUNS; run++) {
      const { left, right } = createQuestion(getLevel('expert'));
      for (const operand of [left, right]) {
        expect(operand).toBeGreaterThanOrEqual(10);
        expect(operand).toBeLessThanOrEqual(999);
      }
    }
  });

  it('gives less time as the score grows, down to the level minimum', () => {
    const level = getLevel('normal');
    expect(secondsForQuestion(level, 0, 'true-or-false')).toBe(6);
    expect(secondsForQuestion(level, 5, 'true-or-false')).toBe(5);
    expect(secondsForQuestion(level, 100, 'true-or-false')).toBe(level.minSeconds);
  });

  it('gives more time to type an answer', () => {
    expect(secondsForQuestion(getLevel('normal'), 0, 'your-answer')).toBe(9);
  });

  it('shows the prompt without the result', () => {
    const question: Question = { left: 56, operator: '÷', right: 8, shown: 7, answer: 7 };
    expect(formatPrompt(question)).toBe('56 ÷ 8 =');
  });

  it('accepts only the exact whole number as a typed answer', () => {
    const question: Question = { left: 12, operator: '+', right: 34, shown: 46, answer: 46 };
    expect(isCorrectAnswer(question, '46')).toBe(true);
    expect(isCorrectAnswer(question, ' 46 ')).toBe(true);
    expect(isCorrectAnswer(question, '45')).toBe(false);
    expect(isCorrectAnswer(question, '46.0')).toBe(false);
    expect(isCorrectAnswer(question, '')).toBe(false);
  });
});
