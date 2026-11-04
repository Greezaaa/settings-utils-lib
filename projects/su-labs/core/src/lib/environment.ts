/**
 * Whether the code runs in a browser with DOM access.
 * Used to keep utilities safe to import in Node and during server-side rendering.
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}
