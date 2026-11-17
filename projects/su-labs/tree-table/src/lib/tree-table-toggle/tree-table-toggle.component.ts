import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** A row's open and close button, or the room for one on a row without children, so every row's text lines up */
@Component({
  selector: 'su-lib-tree-table-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tree-table-toggle.component.html',
  styleUrl: './tree-table-toggle.component.scss',
})
export class SuTreeTableToggleComponent {
  /** Whether the row's children show; null for a row without children */
  readonly expanded = input.required<boolean | null>();
  /** The button's name, e.g. “Expand Fruit” */
  readonly label = input.required<string>();
  readonly toggle = output();
}
