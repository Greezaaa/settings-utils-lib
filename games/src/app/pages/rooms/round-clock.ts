import { computed, DestroyRef, inject, Signal, signal } from '@angular/core';
import { RoomClient } from '../../core/room-client';
import { Round } from '../../core/room-view';

/** How often the time left is redrawn */
const TICK_MS = 100;

/** A room round's time on the server's clock: seconds left, the share left (for the timer bar) and whether it's over */
export interface RoundClock {
  readonly secondsLeft: Signal<number>;
  readonly share: Signal<number>;
  readonly isOver: Signal<boolean>;
}

/** The clock of a room round; call it in a component's constructor (it ticks until the component is destroyed) */
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
