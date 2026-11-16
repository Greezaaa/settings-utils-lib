import { ChangeDetectionStrategy, Component, inject, signal, VERSION } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { SuDialogComponent, SuDialogService } from '@su-labs/dialog';
import { SuCheckboxComponent, SuChipsComponent, SuSwitchComponent } from '@su-labs/fields';
import { FontSizeService } from '@su-labs/font-size';
import { SuNotificationComponent, SuNotificationService } from '@su-labs/notifications';
import { ScrollSpyDirective, ScrollSpyService } from '@su-labs/scroll-spy';
import { SuSkeletonComponent } from '@su-labs/skeleton';
import { SuTableColumns, SuTableComponent } from '@su-labs/table';
import { SuThemeService } from '@su-labs/theme';
import { SuVisitTrackerService } from '@su-labs/visit-tracker';

interface Fruit {
  readonly name: string;
  readonly colour: string;
}

@Component({
  selector: 'app-smoke',
  imports: [
    ScrollSpyDirective,
    SuCheckboxComponent,
    SuChipsComponent,
    SuDialogComponent,
    SuNotificationComponent,
    SuSkeletonComponent,
    SuSwitchComponent,
    SuTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 id="smoke-version">Angular {{ version }}</h1>
    <section appScrollSpy="fruits">
      <su-lib-table caption="Fruits" [columns]="columns" [rows]="rows" />
    </section>
    <su-lib-switch [(checked)]="isOn">Switch</su-lib-switch>
    <su-lib-checkbox [(checked)]="isOn">Checkbox</su-lib-checkbox>
    <su-lib-chips label="Colours" [options]="colours" />
    <su-lib-skeleton><p>Loading</p></su-lib-skeleton>
    <button type="button" id="smoke-notify" (click)="notify()">Notify</button>
    <su-lib-notifications />
    <su-lib-dialog />
  `,
})
class Smoke {
  protected readonly version = VERSION.full;
  protected readonly columns: SuTableColumns<Fruit> = [
    { key: 'name', header: 'Name' },
    { key: 'colour', header: 'Colour' },
  ];
  protected readonly rows: readonly Fruit[] = [
    { name: 'Apple', colour: 'Red' },
    { name: 'Lemon', colour: 'Yellow' },
  ];
  protected readonly colours = [
    { value: 'red', label: 'Red' },
    { value: 'green', label: 'Green' },
  ];
  protected readonly isOn = signal(false);
  private readonly notifications = inject(SuNotificationService);

  constructor() {
    inject(SuThemeService);
    inject(FontSizeService);
    inject(SuVisitTrackerService);
    inject(ScrollSpyService);
    inject(SuDialogService);
  }

  protected notify(): void {
    this.notifications.show({ type: 'success', message: 'Hello from the smoke app' });
  }
}

bootstrapApplication(Smoke).catch((error: unknown) => console.error(error));
