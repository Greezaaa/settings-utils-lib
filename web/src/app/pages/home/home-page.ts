import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ENVIRONMENTS } from '../../core/environments';
import { hostOf, SITE_APPS } from '../../core/apps';
import { GUIDES_URL } from '../../core/links';
import { TOOLS, UTILITIES } from '../../core/packages';
import { CodeBlock } from '../../shared/code-block';
import { Reveal } from '../../shared/reveal';

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
  protected readonly tools = TOOLS;
  protected readonly environments = ENVIRONMENTS;
  protected readonly guidesUrl = GUIDES_URL;
  protected readonly apps = SITE_APPS;
  protected readonly hostOf = hostOf;
  protected readonly angularExample = ANGULAR_EXAMPLE;
  protected readonly coreExample = CORE_EXAMPLE;
}
