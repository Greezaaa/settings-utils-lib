import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/**
 * Draws the shapes inside it as grey placeholders with one shimmer sweeping across all of them. It takes no room of its
 * own, so lay the shapes out with the same grid or flex classes as the real content. Give a wrapper that only lays
 * shapes out the `su-skeleton-layout` class so it isn't drawn itself. Hidden from screen readers; mark the region that
 * holds it with `suSkeletonBusy`.
 */
@Component({
  selector: 'su-lib-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './skeleton.component.html',
  styleUrl: '../../../../core/skeleton/skeleton.css',
  host: { class: 'su-skeleton', 'aria-hidden': 'true' },
})
export class SuSkeletonComponent {}
