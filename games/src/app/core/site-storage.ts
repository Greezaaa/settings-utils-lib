/**
 * The games site's small per-browser memory (language, best scores, chosen colours…), as JSON under
 * `su-labs-games:<name>`, and the visitor's choice about it.
 *
 * Saving is on unless the visitor turns it off on the privacy page. Then nothing is saved — not here and
 * not in the shared cookies — and what was saved is deleted; only that choice itself is remembered.
 * Storage can also be missing or blocked (private mode, prerendering): reads fall back to `undefined` and
 * writes may be lost.
 */

const KEY_PREFIX = 'su-labs-games:';

/** Where the visitor's choice is kept; the one thing saved even when saving is off */
const CONSENT_KEY = `${KEY_PREFIX}storage-consent`;

/** Whether the visitor allows saving their preferences (they do until they say otherwise) */
export function isSavingAllowed(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) !== 'denied';
  } catch {
    return false;
  }
}

/**
 * Records the visitor's choice. Turning saving off deletes everything this site saved here;
 * `forget` deletes the rest (the shared cookies), since this module doesn't know about them.
 */
export function setSavingAllowed(allowed: boolean, forget: () => void): void {
  try {
    if (allowed) {
      localStorage.removeItem(CONSENT_KEY);
      return;
    }
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
    localStorage.setItem(CONSENT_KEY, 'denied');
    forget();
  } catch {
    // Storage blocked: nothing was saved anyway
  }
}

/**
 * Deletes everything this site saved here, keeping only the visitor's choice about saving;
 * `forget` deletes the rest (the shared cookies).
 */
export function deleteSaved(forget: () => void): void {
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(KEY_PREFIX) && key !== CONSENT_KEY) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // Storage blocked: nothing was saved anyway
  }
  forget();
}

/** The stored value, or `undefined` when there is none, it can't be read, or saving is off */
export function readStored(name: string): unknown {
  if (!isSavingAllowed()) {
    return undefined;
  }
  try {
    const raw = localStorage.getItem(KEY_PREFIX + name);
    return raw === null ? undefined : JSON.parse(raw);
  } catch {
    return undefined;
  }
}

/** Saves a value, unless the visitor turned saving off */
export function writeStored(name: string, value: unknown): void {
  if (!isSavingAllowed()) {
    return;
  }
  try {
    localStorage.setItem(KEY_PREFIX + name, JSON.stringify(value));
  } catch {
    // Private mode or blocked storage: the value just isn't kept
  }
}
