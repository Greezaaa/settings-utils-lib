import { DOCUMENT } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, inject, Injector, input, signal, viewChild } from '@angular/core';
import { formatLinear, simulate } from '../../spring-easing/spring';

export type MorphMenuVariant = 'smooth' | 'bouncy';

const MENU_ITEMS: readonly string[] = ['New file', 'Upload', 'Share', 'Settings', 'Sign out'];
const VIEWPORT_MARGIN = 16;
const BOUNCE_MOTION = simulate({ stiffness: 220, damping: 11, mass: 1 });

@Component({
  selector: 'app-morph-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './morph-menu.html',
  styleUrl: './morph-menu.scss',
  host: {
    '[class.is-bouncy]': "variant() === 'bouncy'",
    '[style.--menu-bounce-easing]': 'bounceEasing',
    '[style.--menu-bounce-duration]': 'bounceDuration',
    '(click)': 'closeOnBackdrop($event)',
    '(window:resize)': 'place()',
    '(window:scroll)': 'place()',
  },
})
export class MorphMenu {
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  readonly variant = input<MorphMenuVariant>('smooth');
  readonly label = input('Menu');

  protected readonly items = MENU_ITEMS;
  protected readonly bounceEasing = formatLinear(BOUNCE_MOTION);
  protected readonly bounceDuration = `${BOUNCE_MOTION.duration}ms`;
  protected readonly isOpen = signal(false);
  protected readonly closing = signal(false);
  protected readonly chosen = signal<string | null>(null);

  protected open(): void {
    this.isOpen.set(true);
    this.dialog().nativeElement.showModal();
    this.scrollIntoRoom();
    this.place();
    this.document.documentElement.style.overflow = 'hidden';
  }

  protected place(): void {
    const dialog = this.dialog().nativeElement;
    if (!dialog.open) {
      return;
    }
    const { top, left } = this.trigger().nativeElement.getBoundingClientRect();
    dialog.style.top = `${top}px`;
    dialog.style.left = `${left}px`;
  }

  protected async close(): Promise<void> {
    if (!this.isOpen() || this.closing()) {
      return;
    }
    this.closing.set(true);
    await this.animationsDone();
    this.dialog().nativeElement.close();
    this.document.documentElement.style.removeProperty('overflow');
    this.closing.set(false);
    this.isOpen.set(false);
    this.trigger().nativeElement.focus();
  }

  protected cancel(event: Event): void {
    event.preventDefault();
    this.close();
  }

  protected closeOnBackdrop(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) {
      this.close();
    }
  }

  protected choose(item: string): void {
    this.chosen.set(item);
    this.close();
  }

  private scrollIntoRoom(): void {
    const view = this.document.defaultView;
    const { top } = this.trigger().nativeElement.getBoundingClientRect();
    const height = this.dialog().nativeElement.getBoundingClientRect().height;
    const overflow = top + height + VIEWPORT_MARGIN - (view?.innerHeight ?? 0);
    if (overflow > 0) {
      view?.scrollBy({ top: Math.min(overflow, top - VIEWPORT_MARGIN), behavior: 'instant' });
    }
  }

  private animationsDone(): Promise<void> {
    return new Promise((resolve) =>
      afterNextRender(
        () => {
          const animations = this.dialog().nativeElement.getAnimations({ subtree: true });
          Promise.allSettled(animations.map(({ finished }) => finished)).then(() => resolve());
        },
        { injector: this.injector },
      ),
    );
  }
}
