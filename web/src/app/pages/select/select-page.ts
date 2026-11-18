import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { SuSelectOption } from '@su-labs/core/select';
import { SuSelectComponent } from '@su-labs/select';
import { getUtility } from '../../core/packages';
import { CodeTab } from '../../shared/code-tabs';
import { PageFeatureExample } from '../../shared/page-feature';
import { selectOptions } from '../../shared/select-options';
import { UtilityPage } from '../../shared/utility-page';
import { SELECT_FEATURES } from './select-features';

const COUNTRIES: readonly SuSelectOption<string>[] = [
  { value: 'es', label: 'Spain', group: 'Europe' },
  { value: 'fr', label: 'France', group: 'Europe' },
  { value: 'de', label: 'Germany', group: 'Europe' },
  { value: 'is', label: 'Iceland', group: 'Europe', disabled: true },
  { value: 'pt', label: 'Portugal', group: 'Europe' },
  { value: 'ua', label: 'Ukraine', group: 'Europe' },
  { value: 'ca', label: 'Canada', group: 'Americas' },
  { value: 'mx', label: 'México', group: 'Americas' },
  { value: 'us', label: 'United States', group: 'Americas' },
  { value: 'jp', label: 'Japan', group: 'Asia' },
  { value: 'kr', label: 'South Korea', group: 'Asia', disabled: true },
  { value: 'vn', label: 'Vietnam', group: 'Asia' },
];

const DELIVERY: readonly SuSelectOption<string>[] = [
  { value: 'standard', label: 'Standard', group: 'Ground' },
  { value: 'express', label: 'Express', group: 'Ground' },
  { value: 'drone', label: 'Drone', group: 'Air', disabled: true },
  { value: 'plane', label: 'Air mail', group: 'Air' },
];

const SIZES = selectOptions(['Small', 'Medium', 'Large', 'Extra large']);

const USAGE: readonly CodeTab[] = [
  {
    label: 'Angular',
    code: `<label>
  Country
  <su-lib-select searchable [options]="countries" [(value)]="country" />
</label>

countries: SuSelectOption<string>[] = [
  { value: 'es', label: 'Spain', group: 'Europe' },
  { value: 'is', label: 'Iceland', group: 'Europe', disabled: true },
  { value: 'jp', label: 'Japan', group: 'Asia' },
];
country = signal<string | null>('es');`,
  },
  {
    label: 'Other frameworks',
    code: `import { SuSelectController, suSelectGroups } from '@su-labs/core/select';

const select = new SuSelectController({ options, value: 'es' });

trigger.addEventListener('click', () => select.toggle());
trigger.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowDown') select.state.get().open ? select.move('next') : select.open();
  if (event.key === 'Enter') select.choose();
  if (event.key === 'Escape') select.close();
  if (event.key.length === 1) select.typeAhead(event.key);
});
select.state.subscribe(({ open, value, visible, active }) => {
  render(suSelectGroups(visible), visible[active]);
});`,
  },
  {
    label: 'CSS',
    code: `su-lib-select {
  --su-select-background: #0f172a;
  --su-select-color: #f8fafc;
  --su-select-border: 1px solid #334155;
  --su-select-option-active-background: #1e293b;
}`,
  },
];

@Component({
  selector: 'app-select-page',
  imports: [PageFeatureExample, SuSelectComponent, UtilityPage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-page.html',
  styleUrl: './select-page.scss',
})
export class SelectPage {
  protected readonly utility = getUtility('select');
  protected readonly usage = USAGE;
  protected readonly features = SELECT_FEATURES;
  protected readonly countries = COUNTRIES;
  protected readonly delivery = DELIVERY;
  protected readonly sizes = SIZES;

  protected readonly searchable = signal(true);
  protected readonly disabled = signal(false);
  protected readonly animated = signal(true);
  protected readonly country = signal<string | null>(null);
  protected readonly open = signal(false);
  protected readonly method = signal<string | null>('standard');
  protected readonly size = signal<string | null>('Medium');

  protected setFlag(flag: (value: boolean) => void, event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      flag(event.target.checked);
    }
  }
}
