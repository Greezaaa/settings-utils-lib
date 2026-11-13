import { afterNextRender, afterRenderEffect, DestroyRef, Directive, DOCUMENT, ElementRef, inject, input, signal } from '@angular/core';
import { DriftShape } from './drift-shape';

@Directive({
  selector: '[appMenuRing]',
  host: {
    '[class.has-menu-ring]': 'isOn()',
    '(pointermove)': 'onPointer($event)',
    '(pointerleave)': 'rest()',
    '(focusin)': 'onFocus($event)',
    '(focusout)': 'rest()',
    '(window:resize)': 'rest()',
  },
})
export class MenuRing {
  readonly enabled = input(false, { alias: 'appMenuRing' });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly window = inject(DOCUMENT).defaultView;
  private readonly suits = signal(false);
  private shape: DriftShape | null = null;

  protected isOn(): boolean {
    return this.enabled() && this.suits();
  }

  constructor() {
    afterNextRender(() => {
      const window = this.window;
      if (window) {
        this.suits.set(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
        this.shape = new DriftShape(
          this.host,
          { items: 'a', current: 'a.active', className: 'menu-ring', wrapX: 10, wrapY: 6, isOn: () => this.isOn() },
          window,
        );
      }
    });
    afterRenderEffect(() => {
      if (this.isOn()) {
        this.shape?.rest();
      } else {
        this.shape?.hide();
      }
    });
    inject(DestroyRef).onDestroy(() => this.shape?.destroy());
  }

  protected onPointer(event: PointerEvent): void {
    if (this.isOn()) {
      this.shape?.pointer(event);
    }
  }

  protected onFocus(event: FocusEvent): void {
    if (this.isOn()) {
      this.shape?.focus(event);
    }
  }

  protected rest(): void {
    if (this.isOn()) {
      this.shape?.rest();
    }
  }
}
