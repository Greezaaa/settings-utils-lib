import { booleanAttribute, ChangeDetectionStrategy, Component, input, model } from '@angular/core';

/** One chip: the value it stands for and its text */
export interface SuChipOption<TValue extends string> {
  readonly value: TValue;
  readonly label: string;
  readonly disabled?: boolean;
}

/**
 * Toggle chips to pick several options (or one, with `multiple` off): each is a button that pops a tick in when
 * picked. `<su-lib-chips label="Categories" [options]="categories" [(value)]="picked" />`
 */
@Component({
  selector: 'su-lib-chips',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chips.component.html',
  styleUrl: './chips.component.scss',
})
export class SuChipsComponent<TValue extends string> {
  readonly options = input.required<readonly SuChipOption<TValue>[]>();
  /** The picked values, in the options' order */
  readonly value = model<readonly TValue[]>([]);
  /** The group's name for screen readers */
  readonly label = input.required<string>();
  /** Several can be picked; off, picking one replaces the other @default true */
  readonly multiple = input(true, { transform: booleanAttribute });

  protected isPicked(value: TValue): boolean {
    return this.value().includes(value);
  }

  protected toggle(option: SuChipOption<TValue>): void {
    if (!this.multiple()) {
      this.value.set([option.value]);
      return;
    }
    const picked = this.isPicked(option.value)
      ? this.value().filter((value) => value !== option.value)
      : [...this.value(), option.value];
    this.value.set(this.options().map((item) => item.value).filter((value) => picked.includes(value)));
  }
}
