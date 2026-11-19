import { DOCUMENT } from '@angular/common';
import { afterNextRender, ApplicationRef, ChangeDetectionStrategy, Component, ElementRef, inject, Injector, signal, viewChild } from '@angular/core';
import { SiteMotion } from '../../../core/site-motion';

interface Card {
  readonly id: number;
  readonly title: string;
  readonly summary: string;
  readonly color: string;
}

const DETAILS_OUT_MS = 120;
const GOING_BACK_CLASS = 'lab-going-back';
const CARDS: readonly Card[] = [
  { id: 1, title: 'Sea cliffs', summary: 'Three days along the coast path.', color: '#7cc4e4' },
  { id: 2, title: 'Pine forest', summary: 'A quiet loop under tall trees.', color: '#6fae7f' },
  { id: 3, title: 'Desert dunes', summary: 'Sunrise walk across the sand.', color: '#e7b46a' },
];

@Component({
  selector: 'app-card-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card-detail.html',
  styleUrl: './card-detail.scss',
})
export class CardDetail {
  private readonly document = inject(DOCUMENT);
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(Injector);
  private readonly motion = inject(SiteMotion);
  private readonly details = viewChild<ElementRef<HTMLElement>>('details');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly cards = CARDS;
  protected readonly selected = signal<Card | null>(null);
  protected readonly morphingId = signal<number | null>(null);

  protected open(card: Card): void {
    this.morphingId.set(card.id);
    this.morph(() => this.selected.set(card));
  }

  protected async back(): Promise<void> {
    const card = this.selected();
    if (!card) {
      return;
    }
    const details = this.details()?.nativeElement;
    if (details && !this.motion.shouldReduce()) {
      await details.animate([{ opacity: 1 }, { opacity: 0 }], { duration: DETAILS_OUT_MS, fill: 'forwards' }).finished;
    }
    this.document.documentElement.classList.add(GOING_BACK_CLASS);
    this.morph(
      () => this.selected.set(null),
      () => this.focusCard(card.id),
    );
  }

  private morph(update: () => void, done?: () => void): void {
    if (this.motion.shouldReduce() || !('startViewTransition' in this.document)) {
      update();
      this.document.documentElement.classList.remove(GOING_BACK_CLASS);
      afterNextRender(() => done?.(), { injector: this.injector });
      return;
    }
    this.appRef.tick();
    const transition = this.document.startViewTransition(() => {
      update();
      this.appRef.tick();
    });
    transition.updateCallbackDone.then(() => done?.());
    transition.finished.finally(() => {
      this.document.documentElement.classList.remove(GOING_BACK_CLASS);
      if (!this.selected()) {
        this.morphingId.set(null);
      }
    });
  }

  private focusCard(id: number): void {
    this.host.querySelector<HTMLElement>(`[data-card-id="${id}"]`)?.focus({ preventScroll: true });
  }
}
