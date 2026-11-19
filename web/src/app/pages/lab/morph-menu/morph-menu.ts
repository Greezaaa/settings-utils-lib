import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, inject, Injector, input, signal, viewChild } from '@angular/core';
import { formatLinear, simulate } from '../../spring-easing/spring';

interface MenuPosition {
  readonly top: number;
  readonly left: number;
}

export type MorphMenuVariant = 'smooth' | 'bouncy';

const MENU_ITEMS: readonly string[] = ['New file', 'Upload', 'Share', 'Settings', 'Sign out'];
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
  },
})
export class MorphMenu {
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
  protected readonly position = signal<MenuPosition>({ top: 0, left: 0 });
  protected readonly chosen = signal<string | null>(null);

  protected open(): void {
    const { top, left } = this.trigger().nativeElement.getBoundingClientRect();
    this.position.set({ top, left });
    this.isOpen.set(true);
    this.dialog().nativeElement.showModal();
  }

  protected async close(): Promise<void> {
    if (!this.isOpen() || this.closing()) {
      return;
    }
    this.closing.set(true);
    await this.animationsDone();
    this.dialog().nativeElement.close();
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
