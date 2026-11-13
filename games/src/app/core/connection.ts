import { afterNextRender, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Connection {
  private readonly online = signal(true);
  readonly isOnline = this.online.asReadonly();

  constructor() {
    afterNextRender(() => {
      const update = (): void => this.online.set(navigator.onLine);
      update();
      window.addEventListener('online', update);
      window.addEventListener('offline', update);
    });
  }
}
