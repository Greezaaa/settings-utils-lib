import { afterNextRender, DestroyRef, Directive, DOCUMENT, ElementRef, inject, input } from '@angular/core';

@Directive({ selector: '[appScrollToActive]' })
export class ScrollToActive {
  readonly activeSelector = input('a.active', { alias: 'appScrollToActive', transform: (value: string) => value || 'a.active' });
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly window = inject(DOCUMENT).defaultView;
  private activeLink: Element | null = null;
  private stop: () => void = () => undefined;

  constructor() {
    afterNextRender(() => {
      const watcher = new MutationObserver(() => this.reveal());
      watcher.observe(this.host, { attributes: true, attributeFilter: ['class', 'aria-selected'], childList: true, subtree: true });
      this.reveal();
      this.stop = () => watcher.disconnect();
    });
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  private reveal(): void {
    const active = this.host.querySelector(this.activeSelector());
    if (!active || active === this.activeLink) {
      return;
    }
    if (this.host.scrollWidth <= this.host.clientWidth) {
      return;
    }
    const isFirst = this.activeLink === null;
    this.activeLink = active;
    const menu = this.host.getBoundingClientRect();
    const link = active.getBoundingClientRect();
    const left = this.host.scrollLeft + link.left - menu.left - (menu.width - link.width) / 2;
    const calm = this.window?.matchMedia('(prefers-reduced-motion: reduce)').matches ?? true;
    this.host.scrollTo({ left: Math.max(0, left), behavior: calm || isFirst ? 'auto' : 'smooth' });
  }
}
