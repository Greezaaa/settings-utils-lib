import { afterNextRender, effect, inject, Injectable, signal } from '@angular/core';
import { Connection } from './connection';
import { GamesApi } from './games-api';
import { flushOutbox } from './outbox';

@Injectable({ providedIn: 'root' })
export class OutboxSender {
  private readonly api = inject(GamesApi);
  private isSending = false;

  constructor() {
    const connection = inject(Connection);
    const isRendered = signal(false);
    afterNextRender(() => isRendered.set(true));
    effect(() => {
      if (isRendered() && connection.isOnline()) {
        void this.send();
      }
    });
  }

  private async send(): Promise<void> {
    if (this.isSending) {
      return;
    }
    this.isSending = true;
    await flushOutbox((item) => this.api.sendQueued(item));
    this.isSending = false;
  }
}
