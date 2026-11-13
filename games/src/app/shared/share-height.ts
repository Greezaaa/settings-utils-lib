import { afterNextRender, DestroyRef, Directive, DOCUMENT, ElementRef, inject, input } from '@angular/core';

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
