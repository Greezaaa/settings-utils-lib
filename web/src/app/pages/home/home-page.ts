import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { guideUrl, GUIDES_URL } from '../../core/links';
import { UTILITIES } from '../../core/packages';
import { CodeBlock } from '../../shared/code-block';
import { Reveal } from '../../shared/reveal';

/** Environments with an installation guide */
const ENVIRONMENTS = [
  { name: 'Angular', detail: 'Services with signals, one package per utility', guide: 'angular' },
  { name: 'React', detail: 'useSyncExternalStore, no adapter needed', guide: 'react' },
  { name: 'Svelte', detail: 'Stores work with the $ syntax directly', guide: 'svelte' },
  { name: 'Vanilla JavaScript', detail: 'With a bundler or straight from a CDN', guide: 'vanilla' },
  { name: 'Node and SSR', detail: 'Safe to import on the server', guide: 'node' },
] as const;

const ANGULAR_EXAMPLE = `import { inject } from '@angular/core';
import { SuThemeService } from '@su-labs/theme';

export class Toolbar {
  protected readonly theme = inject(SuThemeService);
  // template: {{ theme.theme() }}
}`;

const CORE_EXAMPLE = `import { SuThemeController } from '@su-labs/core/theme';

const theme = new SuThemeController();
theme.init({ defaultTheme: 'system' });
theme.theme.subscribe((name) => console.log(name));`;

@Component({
  selector: 'app-home-page',
  imports: [CodeBlock, Reveal, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  protected readonly utilities = UTILITIES;
  protected readonly environments = ENVIRONMENTS.map((environment) => ({ ...environment, url: guideUrl(environment.guide) }));
  protected readonly guidesUrl = GUIDES_URL;
  protected readonly angularExample = ANGULAR_EXAMPLE;
  protected readonly coreExample = CORE_EXAMPLE;
}
