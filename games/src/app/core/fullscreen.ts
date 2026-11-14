import { afterNextRender, computed, DOCUMENT, inject, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Fullscreen {
  private readonly document = inject(DOCUMENT);
  private readonly supported = signal(false);
  private readonly on = signal(false);
  private readonly board = signal<HTMLElement | null>(null);

  readonly isSupported = this.supported.asReadonly();
  readonly isOn = this.on.asReadonly();
  readonly hasBoard = computed(() => this.board() !== null);

  constructor() {
    afterNextRender(() => {
      this.supported.set(this.document.fullscreenEnabled === true);
      this.document.addEventListener('fullscreenchange', () => this.on.set(this.document.fullscreenElement !== null));
    });
  }

  register(board: HTMLElement): void {
    this.board.set(board);
  }

  unregister(board: HTMLElement): void {
    if (this.board() === board) {
      this.board.set(null);
    }
  }

  async toggle(): Promise<void> {
    const board = this.board();
    if (this.document.fullscreenElement) {
      await this.document.exitFullscreen().catch(() => undefined);
    } else if (board) {
      await board.requestFullscreen({ navigationUI: 'hide' }).catch(() => undefined);
    }
  }
}
