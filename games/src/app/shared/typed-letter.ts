/** What a key press means in a letter game: a letter, deleting, confirming, or nothing */
export type TypedKey =
  | { readonly kind: 'letter'; readonly letter: string }
  | { readonly kind: 'delete' }
  | { readonly kind: 'enter' }
  | null;

/** Keys the player may hold for typing (Shift for capitals); with any other, the key belongs to the browser */
const isShortcut = (event: KeyboardEvent): boolean => event.ctrlKey || event.metaKey || event.altKey;

/** Whether the key was pressed while typing in a form field, where it must stay the field's */
const isInField = (event: KeyboardEvent): boolean =>
  event.target instanceof HTMLElement &&
  (event.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName));

/**
 * Reads a key press for the letter games: any single letter (in every alphabet, ñ and Cyrillic too) as lowercase,
 * Backspace as delete and Enter as confirm. Shortcuts and typing in form fields are left alone.
 */
export function typedKey(event: KeyboardEvent): TypedKey {
  if (isShortcut(event) || isInField(event)) {
    return null;
  }
  if (event.key === 'Backspace') {
    return { kind: 'delete' };
  }
  if (event.key === 'Enter') {
    return { kind: 'enter' };
  }
  return /^\p{L}$/u.test(event.key) ? { kind: 'letter', letter: event.key.toLowerCase() } : null;
}
