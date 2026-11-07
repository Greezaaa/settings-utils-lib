/**
 * The game's small per-browser memory (best scores, chosen colours).
 * Storage can be missing or blocked (private mode, prerendering), so reads fall back and writes may be lost.
 */

/** Prefix of every key the Math games store */
const KEY_PREFIX = 'su-labs-games:math-games:';

/** The stored JSON value, or `undefined` when there is none or it can't be read */
export function readStored(name: string): unknown {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + name);
    return raw === null ? undefined : JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export function writeStored(name: string, value: unknown): void {
  try {
    localStorage.setItem(KEY_PREFIX + name, JSON.stringify(value));
  } catch {
    // Private mode or blocked storage: the value just isn't kept
  }
}
