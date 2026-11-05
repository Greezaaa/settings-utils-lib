import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FontSizeService } from '@su-labs/font-size';
import { getUtility } from '../../core/packages';
import { CodeTab } from '../../shared/code-tabs';
import { UtilityPage } from '../../shared/utility-page';

const USAGE: readonly CodeTab[] = [
  {
    label: 'Angular',
    code: `// app.config.ts
provideAppInitializer(() => {
  const fontSize = inject(FontSizeService);
  fontSize.configure({ defaultSize: 16, minSize: 12, maxSize: 22 });
  fontSize.init();
});

// template
<button (click)="fontSize.decrease()" [disabled]="fontSize.isMin()">A-</button>
<button (click)="fontSize.increase()" [disabled]="fontSize.isMax()">A+</button>`,
  },
  {
    label: 'Any framework',
    code: `import { SuFontSizeController } from '@su-labs/core/font-size';

const fontSize = new SuFontSizeController();
fontSize.configure({ defaultSize: 16, minSize: 12, maxSize: 22 });
fontSize.init();

fontSize.increase();
fontSize.fontSize.subscribe((size) => console.log(size));`,
  },
  {
    label: 'CSS',
    code: `html {
  font-size: var(--base-font-size);
}

/* size everything else in rem */
h1 {
  font-size: 2rem;
}`,
  },
];

@Component({
  selector: 'app-font-size-page',
  imports: [UtilityPage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './font-size-page.html',
})
export class FontSizePage {
  protected readonly utility = getUtility('font-size');
  protected readonly usage = USAGE;
  protected readonly fontSize = inject(FontSizeService);

  protected onSlide(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.fontSize.setFontSize(event.target.valueAsNumber);
    }
  }
}
