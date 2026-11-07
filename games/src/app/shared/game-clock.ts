import { computed, signal } from '@angular/core';

/** Seconds as `m:ss`, e.g. `1:05` */
export function formatTime(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

/**
 * A game's running time, started on the first move and stopped when the game ends.
 * Its owner calls `stop()` when it is destroyed.
 */
export class GameClock {
  readonly seconds = signal(0);
  /** The time as `m:ss` */
  readonly time = computed(() => formatTime(this.seconds()));

  private timer?: ReturnType<typeof setInterval>;

  start(): void {
    this.stop();
    const startedAt = Date.now() - this.seconds() * 1000;
    this.timer = setInterval(() => this.seconds.set(Math.floor((Date.now() - startedAt) / 1000)), 1000);
  }

  stop(): void {
    clearInterval(this.timer);
  }

  reset(): void {
    this.stop();
    this.seconds.set(0);
  }
}
