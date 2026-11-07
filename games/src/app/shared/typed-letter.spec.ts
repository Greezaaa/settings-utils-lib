import { describe, expect, it } from 'vitest';
import { typedKey } from './typed-letter';

const press = (key: string, init: KeyboardEventInit = {}) => new KeyboardEvent('keydown', { key, ...init });

describe('typedKey', () => {
  it('reads letters of any alphabet as lowercase', () => {
    expect(typedKey(press('A', { shiftKey: true }))).toEqual({ kind: 'letter', letter: 'a' });
    expect(typedKey(press('ñ'))).toEqual({ kind: 'letter', letter: 'ñ' });
    expect(typedKey(press('Ї'))).toEqual({ kind: 'letter', letter: 'ї' });
  });

  it('reads Backspace and Enter', () => {
    expect(typedKey(press('Backspace'))).toEqual({ kind: 'delete' });
    expect(typedKey(press('Enter'))).toEqual({ kind: 'enter' });
  });

  it('leaves shortcuts, other keys and form fields alone', () => {
    expect(typedKey(press('r', { metaKey: true }))).toBeNull();
    expect(typedKey(press('c', { ctrlKey: true }))).toBeNull();
    expect(typedKey(press('1'))).toBeNull();
    expect(typedKey(press('ArrowLeft'))).toBeNull();
    const input = document.createElement('input');
    const inField = press('a');
    Object.defineProperty(inField, 'target', { value: input });
    expect(typedKey(inField)).toBeNull();
  });
});
