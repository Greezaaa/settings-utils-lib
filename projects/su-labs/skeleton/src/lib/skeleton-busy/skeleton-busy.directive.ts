import { booleanAttribute, Directive, input } from '@angular/core';

/**
 * Put it on the region that shows a skeleton while loading and the content once it's ready:
 * `<section [suSkeletonBusy]="loading()">`. Screen readers hear the region is busy, then the content politely.
 */
@Directive({
  selector: '[suSkeletonBusy]',
  host: { 'aria-live': 'polite', '[attr.aria-busy]': 'busy()' },
})
export class SuSkeletonBusyDirective {
  /** The content is still loading */
  readonly busy = input(false, {
    alias: 'suSkeletonBusy',
    transform: booleanAttribute,
  });
}
