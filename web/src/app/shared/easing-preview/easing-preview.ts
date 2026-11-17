import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { SiteMotion } from '../../core/site-motion';

export type PreviewEffect = 'move' | 'scale' | 'fade';

export interface PreviewLane {
  readonly label: string;
  readonly ease: (progress: number) => number;
}

const EFFECTS: readonly { readonly value: PreviewEffect; readonly label: string }[] = [
  { value: 'move', label: 'Move' },
  { value: 'scale', label: 'Scale' },
  { value: 'fade', label: 'Fade' },
];

@Component({
  selector: 'app-easing-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './easing-preview.html',
  styleUrl: './easing-preview.scss',
})
export class EasingPreview {
  readonly lanes = input.required<readonly PreviewLane[]>();
  readonly duration = input.required<number>();

  private readonly motion = inject(SiteMotion);
  private readonly progress = signal(0);
  private frame?: number;

  protected readonly effects = EFFECTS;
  protected readonly effect = signal<PreviewEffect>('move');
  protected readonly easedLanes = computed(() =>
    this.lanes().map((lane) => ({ ...lane, value: lane.ease(this.progress()) })),
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  play(): void {
    this.stop();
    const startedAt = performance.now();
    const tick = (now: number): void => {
      const progress = Math.min(1, (now - startedAt) / this.duration());
      this.progress.set(progress);
      this.frame = progress < 1 ? requestAnimationFrame(tick) : undefined;
    };
    this.progress.set(0);
    this.frame = requestAnimationFrame(tick);
  }

  autoplay(): void {
    if (!this.motion.shouldReduce()) {
      this.play();
    }
  }

  protected chooseEffect(effect: PreviewEffect): void {
    this.effect.set(effect);
    this.autoplay();
  }

  private stop(): void {
    if (this.frame !== undefined) {
      cancelAnimationFrame(this.frame);
      this.frame = undefined;
    }
  }
}
