import { ChangeDetectionStrategy, Component, model } from '@angular/core';

@Component({
  selector: 'app-pin-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pin-button.html',
  styleUrl: './pin-button.scss',
})
export class PinButton {
  readonly pinned = model(false);

  protected toggle(): void {
    this.pinned.update((pinned) => !pinned);
  }
}
