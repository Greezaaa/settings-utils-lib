import { computed, DestroyRef, inject, Signal, signal } from '@angular/core';
import { RoomClient } from '../../core/room-client';
import { Round } from '../../core/room-view';

const TICK_MS = 100;

export interface RoundClock {
  readonly secondsLeft: Signal<number>;
  readonly share: Signal<number>;
  readonly isOver: Signal<boolean>;
}

export function roundClock(round: Signal<Round>): RoundClock {
  const client = inject(RoomClient);
  const now = signal(client.serverNow());
  const ticker = setInterval(() => now.set(client.serverNow()), TICK_MS);
  inject(DestroyRef).onDestroy(() => clearInterval(ticker));

  const secondsLeft = computed(() =>
    Math.max(0, Math.ceil((round().endsAt - now()) / 1000))
  );
  return {
    secondsLeft,
    share: computed(() => {
      const { startsAt, endsAt } = round();
      return Math.max(0, Math.min(1, (endsAt - now()) / (endsAt - startsAt)));
    }),
    isOver: computed(() => secondsLeft() === 0),
  };
}
