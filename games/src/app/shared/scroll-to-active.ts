import { afterNextRender, DestroyRef, Directive, DOCUMENT, ElementRef, inject } from '@angular/core';

/**
 * For a menu that scrolls sideways (the header menu on phones): whenever a link becomes the current page's
 * (`a.active`), the menu scrolls to bring it to the middle, so the page you're on is always in view. It never scrolls
 * the page itself, and glides only for visitors who don't ask their device for less motion.
 */
@Directive({ selector: '[appScrollToActive]' })
export class ScrollToActive {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly window = inject(DOCUMENT).defaultView;
  private activeLink: Element | null = null;
  private stop: () => void = () => undefined;

  constructor() {
    afterNextRender(() => {
      // Links come and go (the games list loads after the first render) and become current on each page change
      const watcher = new MutationObserver(() => this.reveal());
      watcher.observe(this.host, { attributes: true, attributeFilter: ['class'], childList: true, subtree: true });
      this.reveal();
      this.stop = () => watcher.disconnect();
    });
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  private reveal(): void {
    const active = this.host.querySelector('a.active');
    if (!active || active === this.activeLink) {
      return;
    }
    // Nothing to scroll yet (e.g. before every game is listed): try again on the next change
    if (this.host.scrollWidth <= this.host.clientWidth) {
      return;
    }
    // On a fresh page it jumps there (a glide would be cut short as the page itself scrolls to the top)
    const isFirst = this.activeLink === null;
    this.activeLink = active;
    const menu = this.host.getBoundingClientRect();
    const link = active.getBoundingClientRect();
    const left = this.host.scrollLeft + link.left - menu.left - (menu.width - link.width) / 2;
    const calm = this.window?.matchMedia('(prefers-reduced-motion: reduce)').matches ?? true;
    this.host.scrollTo({ left: Math.max(0, left), behavior: calm || isFirst ? 'auto' : 'smooth' });
  }
}
