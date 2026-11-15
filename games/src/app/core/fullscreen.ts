import { afterNextRender, computed, DOCUMENT, effect, inject, Injectable, signal } from '@angular/core';

const FILLED_CLASS = 'is-filled';

@Injectable({ providedIn: 'root' })
export class Fullscreen {
  private readonly document = inject(DOCUMENT);
  private readonly ready = signal(false);
  private readonly native = signal(false);
  private readonly filled = signal(false);
  private readonly board = signal<HTMLElement | null>(null);

  readonly isSupported = this.ready.asReadonly();
  readonly isOn = computed(() => this.native() || this.filled());
  readonly hasBoard = computed(() => this.board() !== null);

  constructor() {
    afterNextRender(() => {
      this.ready.set(true);
      this.document.addEventListener('fullscreenchange', () =>
        this.native.set(this.document.fullscreenElement !== null),
      );
      this.document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && this.filled()) {
          this.filled.set(false);
        }
      });
    });
    effect(() => {
      const board = this.board();
      const filled = this.filled() && board !== null;
      board?.classList.toggle(FILLED_CLASS, filled);
      this.document.documentElement.classList.toggle(FILLED_CLASS, filled);
    });
  }

  register(board: HTMLElement): void {
    this.board.set(board);
  }

  unregister(board: HTMLElement): void {
    if (this.board() === board) {
      board.classList.remove(FILLED_CLASS);
      this.board.set(null);
      this.filled.set(false);
    }
  }

  async toggle(): Promise<void> {
    const board = this.board();
    if (this.document.fullscreenElement) {
      await this.document.exitFullscreen().catch(() => undefined);
    } else if (this.filled()) {
      this.filled.set(false);
    } else if (board) {
      await this.enter(board);
    }
  }

  private async enter(board: HTMLElement): Promise<void> {
    const isNative =
      this.document.fullscreenEnabled &&
      (await board.requestFullscreen({ navigationUI: 'hide' }).then(
        () => true,
        () => false,
      ));
    this.filled.set(!isNative);
  }
}
