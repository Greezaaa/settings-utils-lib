export type TypedKey =
  | { readonly kind: 'letter'; readonly letter: string }
  | { readonly kind: 'delete' }
  | { readonly kind: 'enter' }
  | null;

const isShortcut = (event: KeyboardEvent): boolean => event.ctrlKey || event.metaKey || event.altKey;

const isInField = (event: KeyboardEvent): boolean =>
  event.target instanceof HTMLElement &&
  (event.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName));

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
