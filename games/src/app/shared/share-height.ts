import { afterNextRender, DestroyRef, Directive, DOCUMENT, ElementRef, inject, input } from '@angular/core';

/**
 * Keeps a CSS variable on the page's root at this element's height, e.g. `appShareHeight="--site-header-height"`, so
 * whatever sticks below a sticky bar sits just under it, however tall the bar grows (text size, wrapping, more items).
 */
@Directive({ selector: '[appShareHeight]' })
export class ShareHeight {
  readonly variable = input.required<string>({ alias: 'appShareHeight' });

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const root = inject(DOCUMENT).documentElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const observer = new ResizeObserver(() => root.style.setProperty(this.variable(), `${host.offsetHeight}px`));
      observer.observe(host);
      destroyRef.onDestroy(() => {
        observer.disconnect();
        root.style.removeProperty(this.variable());
      });
    });
  }
}
