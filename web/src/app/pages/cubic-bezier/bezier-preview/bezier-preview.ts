import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { BezierCurve, easeAt } from '../cubic-bezier';

export type PreviewEffect = 'move' | 'scale' | 'fade';

export interface PreviewLane {
  readonly label: string;
  readonly curve: BezierCurve;
}

@Component({
  selector: 'app-bezier-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bezier-preview.html',
  styleUrl: './bezier-preview.scss',
})
export class BezierPreview {
  readonly lanes = input.required<readonly PreviewLane[]>();
  readonly duration = input.required<number>();
  readonly effect = input.required<PreviewEffect>();

  private readonly progress = signal(0);
  private frame?: number;

  protected readonly playing = signal(false);
  protected readonly easedLanes = computed(() =>
    this.lanes().map((lane) => ({ ...lane, value: easeAt(lane.curve, this.progress()) })),
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  play(): void {
    this.stop();
    const startedAt = performance.now();
    this.playing.set(true);
    const tick = (now: number): void => {
      const progress = Math.min(1, (now - startedAt) / this.duration());
      this.progress.set(progress);
      if (progress < 1) {
        this.frame = requestAnimationFrame(tick);
      } else {
        this.frame = undefined;
        this.playing.set(false);
      }
    };
    this.progress.set(0);
    this.frame = requestAnimationFrame(tick);
  }

  private stop(): void {
    if (this.frame !== undefined) {
      cancelAnimationFrame(this.frame);
      this.frame = undefined;
    }
    this.playing.set(false);
  }
}
