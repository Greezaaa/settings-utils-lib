import { computed, DestroyRef, inject, signal } from '@angular/core';

/** How often the remaining time is updated */
const TICK_MS = 50;

/**
 * A countdown for timed games: start it with a duration and what to do when it ends; read the seconds left
 * and the share of time left (for a TimerBar). Create it in a component's field so it stops with the component.
 */
export class Countdown {
  private readonly totalMs = signal(1);
  private readonly remainingMs = signal(0);
  private deadline = 0;
  private timer?: ReturnType<typeof setInterval>;

  readonly secondsLeft = computed(() => Math.ceil(this.remainingMs() / 1000));
  /** From 1 at the start to 0 at the end */
  readonly share = computed(() => this.remainingMs() / this.totalMs());

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  start(ms: number, onEnd: () => void): void {
    this.stop();
    this.totalMs.set(ms);
    this.remainingMs.set(ms);
    this.deadline = Date.now() + ms;
    this.timer = setInterval(() => {
      const remaining = Math.max(0, this.deadline - Date.now());
      this.remainingMs.set(remaining);
      if (remaining === 0) {
        this.stop();
        onEnd();
      }
    }, TICK_MS);
  }

  stop(): void {
    clearInterval(this.timer);
  }
}
