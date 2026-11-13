import { createHash } from 'node:crypto';

const REMEMBER_MS = 24 * 60 * 60 * 1000;

export class RecentReports {
  private readonly seen = new Map<string, number>();

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
    for (const [key, time] of this.seen) {
      if (now - time < REMEMBER_MS) {
        return;
      }
      this.seen.delete(key);
    }
  }
}
