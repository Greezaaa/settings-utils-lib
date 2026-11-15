/**
 * Mark a region as loading for screen readers: `aria-busy` while its skeleton shows, and `aria-live="polite"` so the
 * real content is read out once it's in place.
 *
 * @param region The element that shows the skeleton now and the content later.
 * @param busy Whether the content is still loading.
 */
export function setSuSkeletonBusy(region: Element, busy: boolean): void {
  region.setAttribute('aria-live', 'polite');
  region.setAttribute('aria-busy', String(busy));
}
