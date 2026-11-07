/**
 * The games site's small per-browser memory (language, best scores, chosen colours), as JSON under
 * `su-labs-games:<name>`. Storage can be missing or blocked (private mode, prerendering), so reads fall
 * back to `undefined` and writes may be lost.
 */

const KEY_PREFIX = 'su-labs-games:';

/** The stored value, or `undefined` when there is none or it can't be read */
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
