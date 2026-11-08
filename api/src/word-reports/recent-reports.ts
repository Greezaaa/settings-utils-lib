import { createHash } from 'node:crypto';

/** How long a visitor's report of a word is remembered, so reporting it again doesn't count twice */
const REMEMBER_MS = 24 * 60 * 60 * 1000;

/**
 * Who reported which word lately, so each visitor counts once per word: one person reporting a word three times
 * mustn't hide it for everyone. Kept in memory only, as hashes (never the address itself), and forgotten after a day.
 */
export class RecentReports {
  private readonly seen = new Map<string, number>();

  /** Notes a visitor's report; false when they already reported that word within the day */
  isNew(
    visitor: string,
    language: string,
    word: string,
    now = Date.now(),
  ): boolean {
    this.forgetOld(now);
    const key = createHash('sha256')
      .update(`${visitor}\n${language}\n${word}`)
      .digest('base64url');
    if (this.seen.has(key)) {
      return false;
    }
    this.seen.set(key, now);
    return true;
  }

  private forgetOld(now: number): void {
    // Map keeps insertion order, so the oldest come first
    for (const [key, time] of this.seen) {
      if (now - time < REMEMBER_MS) {
        return;
      }
      this.seen.delete(key);
    }
  }
}
