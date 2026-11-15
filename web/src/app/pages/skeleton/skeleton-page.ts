import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { SuSkeletonBusyDirective, SuSkeletonComponent } from '@su-labs/skeleton';
import { getUtility } from '../../core/packages';
import { CodeTab } from '../../shared/code-tabs';
import { UtilityPage } from '../../shared/utility-page';

const LOADING_TIME = 2500;

const ARTICLES: readonly { title: string; text: string }[] = [
  { title: 'Same layout', text: 'The placeholder uses the grid of the real cards, so nothing jumps when they arrive.' },
  { title: 'One shimmer', text: 'A single shine sweeps across every shape at once.' },
  { title: 'Read out politely', text: 'Screen readers wait while the region is busy, then read the cards.' },
];

const USAGE: readonly CodeTab[] = [
  {
    label: 'Angular',
    code: `<section class="profile" [suSkeletonBusy]="loading()">
  @if (loading()) {
    <su-lib-skeleton>
      <div class="avatar"></div>
      <div class="lines su-skeleton-layout">
        <div></div>
        <div></div>
      </div>
    </su-lib-skeleton>
  } @else {
    <app-profile [user]="user()" />
  }
</section>`,
  },
  {
    label: 'Any framework',
    code: `import '@su-labs/core/skeleton.css';
import { setSuSkeletonBusy } from '@su-labs/core/skeleton';

// <section class="profile">
//   <div class="su-skeleton" aria-hidden="true">...</div>
// </section>
setSuSkeletonBusy(region, true);
region.replaceChildren(renderProfile(await loadUser()));
setSuSkeletonBusy(region, false);`,
  },
  {
    label: 'CSS',
    code: `.profile {
  display: grid;
  gap: 1rem;
  grid-template-columns: 4rem 1fr;
}

.avatar {
  aspect-ratio: 1;
  border-radius: 50%;
}`,
  },
];

@Component({
  selector: 'app-skeleton-page',
  imports: [SuSkeletonBusyDirective, SuSkeletonComponent, UtilityPage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './skeleton-page.html',
  styleUrl: './skeleton-page.scss',
})
export class SkeletonPage {
  protected readonly utility = getUtility('skeleton');
  protected readonly usage = USAGE;
  protected readonly articles = ARTICLES;
  protected readonly loading = signal(true);

  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    afterNextRender(() => this.load());
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected load(): void {
    clearTimeout(this.timer);
    this.loading.set(true);
    this.timer = setTimeout(() => this.loading.set(false), LOADING_TIME);
  }
}
