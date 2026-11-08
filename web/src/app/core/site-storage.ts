import { createSuCookieStorage } from '@su-labs/core';

/**
 * su-labs.dev's small per-browser memory (the visit count of the visit tracker demo, notices seen), as JSON under
 * `su-labs-site:<name>`, and the visitor's choice about saving.
 *
 * Saving is on unless the visitor turns it off on the privacy page. That choice is shared with games.su-labs.dev (one
 * cookie on su-labs.dev, `su-labs:storage-consent`), as both sites share the theme and text size cookies: turning it
 * off on either site deletes what was saved and stops both from saving. Only the choice itself is kept.
 */

const KEY_PREFIX = 'su-labs-site:';

/** The visitor's choice, shared by both su-labs sites; the one thing saved even when saving is off */
export const CONSENT_COOKIE = 'su-labs:storage-consent';
const consentCookies = createSuCookieStorage({ domain: 'su-labs.dev', maxAgeDays: 365 });

/** Whether the visitor allows saving their preferences (they do until they say otherwise) */
export function isSavingAllowed(): boolean {
  try {
    return consentCookies.getItem(CONSENT_COOKIE) !== 'denied';
  } catch {
    return false;
  }
}

/**
 * Records the visitor's choice for both su-labs sites. Turning saving off deletes everything this site saved here;
 * `forget` deletes the rest (the shared cookies).
 */
export function setSavingAllowed(allowed: boolean, forget: () => void): void {
  if (allowed) {
    consentCookies.removeItem(CONSENT_COOKIE);
    return;
  }
  deleteSaved(forget);
  consentCookies.setItem(CONSENT_COOKIE, 'denied');
}

/** Deletes everything this site saved here, keeping only the visitor's choice; `forget` deletes the shared cookies */
export function deleteSaved(forget: () => void): void {
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(KEY_PREFIX)) {
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
