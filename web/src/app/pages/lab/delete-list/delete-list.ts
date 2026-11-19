import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { SiteMotion } from '../../../core/site-motion';

interface ListItem {
  readonly id: number;
  readonly name: string;
}

const FLY_MS = 400;
const COLLAPSE_MS = 200;
const STARTING_ITEMS: readonly ListItem[] = [
  { id: 1, name: 'Invoice March.pdf' },
  { id: 2, name: 'Holiday photos' },
  { id: 3, name: 'Draft notes.txt' },
  { id: 4, name: 'Old logo.svg' },
];

@Component({
  selector: 'app-delete-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './delete-list.html',
  styleUrl: './delete-list.scss',
})
export class DeleteList {
  private readonly motion = inject(SiteMotion);
  private readonly bin = viewChild.required<ElementRef<HTMLElement>>('bin');

  protected readonly items = signal<readonly ListItem[]>(STARTING_ITEMS);
  protected readonly binCount = signal(0);
  protected readonly leaving = signal<ReadonlySet<number>>(new Set());

  protected async remove(item: ListItem, event: Event): Promise<void> {
    const row = event.target instanceof Element ? event.target.closest('li') : null;
    if (!(row instanceof HTMLElement) || this.leaving().has(item.id)) {
      return;
    }
    this.leaving.update((ids) => new Set(ids).add(item.id));
    if (!this.motion.shouldReduce()) {
      await this.flyToBin(row);
      await this.collapse(row);
    }
    this.items.update((items) => items.filter(({ id }) => id !== item.id));
    this.binCount.update((count) => count + 1);
    this.leaving.update((ids) => new Set([...ids].filter((id) => id !== item.id)));
    this.bin().nativeElement.animate([{ scale: 1 }, { scale: 1.2 }, { scale: 1 }], {
      duration: 250,
      easing: 'ease-out',
    });
  }

  protected restore(): void {
    this.items.set(STARTING_ITEMS);
    this.binCount.set(0);
  }

  private flyToBin(row: HTMLElement): Promise<Animation> {
    const from = row.getBoundingClientRect();
    const to = this.bin().nativeElement.getBoundingClientRect();
    const x = to.left + to.width / 2 - (from.left + from.width / 2);
    const y = to.top + to.height / 2 - (from.top + from.height / 2);
    return row.animate(
      [
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${x}px, ${y}px) scale(0.1)`, opacity: 0.2 },
      ],
      { duration: FLY_MS, easing: 'cubic-bezier(0.55, 0, 0.7, 0.4)', fill: 'forwards' },
    ).finished;
  }

  private collapse(row: HTMLElement): Promise<Animation> {
    const height = row.getBoundingClientRect().height;
    return row.animate(
      [
        { height: `${height}px`, marginBlock: '0px' },
        { height: '0px', marginBlock: '-0.25rem' },
      ],
      {
        duration: COLLAPSE_MS,
        easing: 'ease-out',
        fill: 'forwards',
      },
    ).finished;
  }
}
