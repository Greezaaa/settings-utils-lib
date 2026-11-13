import { computed, DestroyRef, inject, signal } from '@angular/core';

const TICK_MS = 50;

export class Countdown {
  private readonly totalMs = signal(1);
  private readonly remainingMs = signal(0);
  private deadline = 0;
  private timer?: ReturnType<typeof setInterval>;

  readonly secondsLeft = computed(() => Math.ceil(this.remainingMs() / 1000));
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
