import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { advance, formatSize, percentOf, secondsLeft, TICK_MS, UploadLane } from './simulated-upload';

@Component({
  selector: 'app-upload-zone',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './upload-zone.html',
  styleUrl: './upload-zone.scss',
})
export class UploadZone {
  private readonly picker = viewChild.required<ElementRef<HTMLInputElement>>('picker');
  private nextId = 1;
  private replacingId?: number;
  private timer?: ReturnType<typeof setInterval>;

  protected readonly lanes = signal<readonly UploadLane[]>([]);
  protected readonly dragOver = signal(false);
  protected readonly summary = computed(() => {
    const lanes = this.lanes();
    const done = lanes.filter(({ status }) => status === 'done').length;
    const failed = lanes.filter(({ status }) => status === 'failed').length;
    return `${done} of ${lanes.length} uploaded${failed ? ` · ${failed} failed` : ''}`;
  });

  protected readonly percentOf = percentOf;
  protected readonly secondsLeft = secondsLeft;
  protected readonly formatSize = formatSize;

  constructor() {
    afterNextRender(() => (this.timer = setInterval(() => this.tick(), TICK_MS)));
    inject(DestroyRef).onDestroy(() => {
      clearInterval(this.timer);
      this.lanes().forEach(({ previewUrl }) => previewUrl && URL.revokeObjectURL(previewUrl));
    });
  }

  protected enter(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(true);
  }

  protected leave(event: DragEvent): void {
    if (
      !(event.relatedTarget instanceof Node) ||
      !(event.currentTarget instanceof Node) ||
      !event.currentTarget.contains(event.relatedTarget)
    ) {
      this.dragOver.set(false);
    }
  }

  protected drop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    this.add(event.dataTransfer?.files);
  }

  protected browse(replaceId?: number): void {
    this.replacingId = replaceId;
    this.picker().nativeElement.click();
  }

  protected picked(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.add(event.target.files);
      event.target.value = '';
    }
  }

  protected retry(id: number): void {
    this.lanes.update((lanes) =>
      lanes.map((lane) => (lane.id === id ? { ...lane, status: 'uploading', attempt: lane.attempt + 1 } : lane)),
    );
  }

  protected remove(id: number): void {
    const lane = this.lanes().find((item) => item.id === id);
    if (lane?.previewUrl) {
      URL.revokeObjectURL(lane.previewUrl);
    }
    this.lanes.update((lanes) => lanes.filter((item) => item.id !== id));
  }

  private add(files: FileList | null | undefined): void {
    const added = Array.from(files ?? []).map((file) => this.laneFor(file));
    if (this.replacingId !== undefined && added.length) {
      this.remove(this.replacingId);
      this.replacingId = undefined;
    }
    this.lanes.update((lanes) => [...lanes, ...added]);
  }

  private laneFor(file: File): UploadLane {
    return {
      id: this.nextId++,
      name: file.name,
      size: Math.max(file.size, 1),
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      sent: 0,
      speed: 0,
      status: 'uploading',
      attempt: 1,
    };
  }

  private tick(): void {
    if (this.lanes().some(({ status }) => status === 'uploading')) {
      this.lanes.update((lanes) => lanes.map((lane) => (lane.status === 'uploading' ? advance(lane) : lane)));
    }
  }
}
