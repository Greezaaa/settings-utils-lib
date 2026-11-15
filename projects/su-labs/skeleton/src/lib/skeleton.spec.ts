import '@angular/compiler';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { SuSkeletonBusyDirective, SuSkeletonComponent } from '../../../../../dist/su-labs/skeleton/fesm2022/su-labs-skeleton.mjs';

@Component({
  imports: [SuSkeletonBusyDirective, SuSkeletonComponent],
  template: `
    <section [suSkeletonBusy]="loading()">
      @if (loading()) {
        <su-lib-skeleton>
          <div class="avatar"></div>
          <div class="su-skeleton-layout"><div></div></div>
        </su-lib-skeleton>
      } @else {
        <p>Ada Lovelace</p>
      }
    </section>
  `,
})
class HostComponent {
  readonly loading = signal(true);
}

describe('SuSkeletonComponent and SuSkeletonBusyDirective', () => {
  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
  });

  afterEach(() => TestBed.resetTestingModule());

  it('shows a hidden skeleton in a busy, polite region while loading', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const region: HTMLElement = fixture.nativeElement.querySelector('section');
    const skeleton = region.querySelector('su-lib-skeleton');

    expect(region).toHaveAttribute('aria-busy', 'true');
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(skeleton).toHaveClass('su-skeleton');
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
  });

  it('clears busy and shows the content once loaded', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    fixture.componentInstance.loading.set(false);
    await fixture.whenStable();
    const region: HTMLElement = fixture.nativeElement.querySelector('section');

    expect(region).toHaveAttribute('aria-busy', 'false');
    expect(region.querySelector('su-lib-skeleton')).toBeNull();
    expect(region).toHaveTextContent('Ada Lovelace');
  });
});
