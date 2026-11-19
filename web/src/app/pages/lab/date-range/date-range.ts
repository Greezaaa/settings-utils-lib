import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { addDays, addMonths, DateRange, daysIn, formatShort, formatTyped, inRange, monthOf, ordered, parseTyped, RANGE_PRESETS, RangePreset, sameDay, startOfDay, WEEKDAYS } from './calendar';

type RangeEdge = 'start' | 'end';

@Component({
  selector: 'app-date-range',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './date-range.html',
  styleUrl: './date-range.scss',
})
export class DateRangePicker {
  protected readonly today = startOfDay(new Date());
  protected readonly presets = RANGE_PRESETS;
  protected readonly weekdays = WEEKDAYS;

  protected readonly view = signal(addMonths(this.today, 0));
  protected readonly start = signal<Date | null>(null);
  protected readonly end = signal<Date | null>(null);
  protected readonly hover = signal<Date | null>(null);
  protected readonly typedError = signal<RangeEdge | null>(null);
  protected readonly confirmed = signal<DateRange | null>(null);

  protected readonly months = computed(() => [monthOf(this.view()), monthOf(addMonths(this.view(), 1))]);
  protected readonly shown = computed<DateRange | null>(() => {
    const start = this.start();
    const end = this.end() ?? this.hover();
    return start && end ? ordered(start, end) : null;
  });
  protected readonly startText = computed(() => this.textOf(this.start()));
  protected readonly endText = computed(() => this.textOf(this.end()));
  protected readonly summary = computed(() => {
    const range = this.shown();
    if (!range) {
      return this.start() ? 'Pick the last day' : 'Pick the first day';
    }
    const days = daysIn(range);
    return `${formatShort(range.start)} – ${formatShort(range.end)} · ${days} ${days === 1 ? 'day' : 'days'}`;
  });

  protected readonly sameDay = sameDay;
  protected readonly inRange = inRange;
  protected readonly formatTyped = formatTyped;

  protected pick(day: Date): void {
    const start = this.start();
    if (!start || this.end()) {
      this.start.set(day);
      this.end.set(null);
      return;
    }
    const range = ordered(start, day);
    this.set(range);
  }

  protected applyPreset(preset: RangePreset): void {
    const range = preset.range(this.today);
    this.set(range);
    this.view.set(addMonths(range.start, 0));
  }

  protected typed(edge: RangeEdge, event: Event): void {
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }
    const date = parseTyped(event.target.value);
    this.typedError.set(date ? null : edge);
    if (date) {
      this.setEdge(edge, date);
    }
  }

  protected nudge(edge: RangeEdge, event: KeyboardEvent): void {
    const step = event.key === 'ArrowUp' ? 1 : event.key === 'ArrowDown' ? -1 : 0;
    const current = edge === 'start' ? this.start() : this.end();
    if (step && current) {
      event.preventDefault();
      this.setEdge(edge, addDays(current, step));
    }
  }

  protected move(months: number): void {
    this.view.update((view) => addMonths(view, months));
  }

  protected confirm(): void {
    this.confirmed.set(this.shown());
  }

  private setEdge(edge: RangeEdge, date: Date): void {
    const start = edge === 'start' ? date : (this.start() ?? date);
    const end = edge === 'end' ? date : (this.end() ?? date);
    this.set(start <= end ? { start, end } : { start: date, end: date });
    this.view.set(addMonths(date, 0));
  }

  private textOf(date: Date | null): string {
    return date ? formatTyped(date) : '';
  }

  private set(range: DateRange): void {
    this.start.set(range.start);
    this.end.set(range.end);
    this.hover.set(null);
  }
}
