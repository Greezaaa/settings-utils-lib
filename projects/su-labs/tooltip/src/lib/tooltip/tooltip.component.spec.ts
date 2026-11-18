import '@angular/compiler';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { SuTooltipOpenOn, SuTooltipTrigger } from '@su-labs/core/tooltip';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { SuTooltipComponent } from '../../../../../../dist/su-labs/tooltip/fesm2022/su-labs-tooltip.mjs';

@Component({
  imports: [SuTooltipComponent],
  template: `
    <su-lib-tooltip
      id="plain"
      text="Saves a draft"
      [trigger]="trigger()"
      [openOn]="openOn()"
      [showDelay]="showDelay()"
      [disabled]="disabled()"
      [labels]="{ more: 'Más información' }"
      [(open)]="open"
      >Save</su-lib-tooltip
    >
    <su-lib-tooltip id="rich" [text]="rich"
      ><button type="button" aria-describedby="hint">Delete</button></su-lib-tooltip
    >
    <ng-template #rich>Deletes <a href="/help">for good</a></ng-template>
    <su-lib-tooltip id="letter" trigger="icon" icon="i" text="Info" />
    <su-lib-tooltip id="custom" trigger="icon" [icon]="star" text="Starred" />
    <ng-template #star><svg class="star" viewBox="0 0 24 24"></svg></ng-template>
    <button type="button" id="outside">Outside</button>
  `,
})
class HostComponent {
  readonly trigger = signal<SuTooltipTrigger>('content');
  readonly openOn = signal<SuTooltipOpenOn | undefined>(undefined);
  readonly showDelay = signal(0);
  readonly disabled = signal(false);
  readonly open = signal(false);
}

async function render(setup: (host: HostComponent) => void = () => undefined) {
  const fixture = TestBed.createComponent(HostComponent);
  setup(fixture.componentInstance);
  await fixture.whenStable();
  const element: HTMLElement = fixture.nativeElement;
  const tooltip = (id: string) => element.querySelector<HTMLElement>(`#${id}`)!;
  const panel = (id: string) =>
    tooltip(id).querySelector<HTMLElement>('.su-tooltip-panel')!;
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
  };
  return { fixture, element, tooltip, panel, settle };
}

describe('SuTooltipComponent', () => {
  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
  });

  afterEach(() => {
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  it('makes plain text a focusable trigger described by a closed tooltip', async () => {
    const { tooltip, panel } = await render();
    const host = tooltip('plain');

    expect(panel('plain')).toHaveAttribute('role', 'tooltip');
    expect(panel('plain')).toHaveTextContent('Saves a draft');
    expect(host).toHaveAttribute('tabindex', '0');
    expect(host).toHaveAttribute('aria-describedby', panel('plain').id);
    expect(panel('plain')).not.toHaveClass('su-tooltip-shown');
  });

  it('describes a focusable element in the content, keeping its own descriptions', async () => {
    const { tooltip, panel } = await render();
    const button = tooltip('rich').querySelector('button');

    expect(tooltip('rich')).not.toHaveAttribute('tabindex');
    expect(button).toHaveAttribute('aria-describedby', `hint ${panel('rich').id}`);
    expect(panel('rich').querySelector('a')).toHaveTextContent('for good');
  });

  it('opens on focus and closes when focus leaves', async () => {
    const { element, tooltip, panel, settle, fixture } = await render();

    tooltip('plain').dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await settle();
    expect(fixture.componentInstance.open()).toBe(true);
    expect(panel('plain')).toHaveClass('su-tooltip-shown');

    tooltip('plain').dispatchEvent(
      new FocusEvent('focusout', {
        bubbles: true,
        relatedTarget: element.querySelector('#outside'),
      })
    );
    await settle();
    expect(fixture.componentInstance.open()).toBe(false);
    expect(panel('plain')).not.toHaveClass('su-tooltip-shown');
  });

  it('opens after the show delay on hover and closes after leaving', async () => {
    const { tooltip, fixture } = await render(host => host.showDelay.set(300));
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

    tooltip('plain').dispatchEvent(new Event('pointerenter'));
    vi.advanceTimersByTime(299);
    expect(fixture.componentInstance.open()).toBe(false);
    vi.advanceTimersByTime(1);
    expect(fixture.componentInstance.open()).toBe(true);

    tooltip('plain').dispatchEvent(new Event('pointerleave'));
    vi.advanceTimersByTime(100);
    expect(fixture.componentInstance.open()).toBe(false);
  });

  it('closes on Escape', async () => {
    const { element, settle, fixture } = await render(host => host.open.set(true));

    element.ownerDocument.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape' })
    );
    await settle();

    expect(fixture.componentInstance.open()).toBe(false);
  });

  it('with openOn click, acts as a button that toggles, and closes on a click outside', async () => {
    const { element, tooltip, panel, settle, fixture } = await render(host =>
      host.openOn.set('click')
    );
    const host = tooltip('plain');

    expect(host).toHaveAttribute('role', 'button');
    expect(host).toHaveAttribute('aria-expanded', 'false');
    expect(host).toHaveAttribute('aria-controls', panel('plain').id);
    expect(host).not.toHaveAttribute('aria-describedby');
    expect(panel('plain')).not.toHaveAttribute('role');

    host.click();
    await settle();
    expect(host).toHaveAttribute('aria-expanded', 'true');

    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await settle();
    expect(fixture.componentInstance.open()).toBe(false);

    host.click();
    await settle();
    element
      .querySelector('#outside')!
      .dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await settle();
    expect(fixture.componentInstance.open()).toBe(false);
  });

  it('with the icon, opens from the "?" button and closes from its close button, focusing the icon again', async () => {
    const { tooltip, panel, settle, fixture } = await render(host =>
      host.trigger.set('icon')
    );
    const icon = tooltip('plain').querySelector<HTMLButtonElement>('.su-tooltip-icon')!;

    expect(icon).toHaveAttribute('aria-label', 'Más información');
    expect(icon).toHaveAttribute('aria-expanded', 'false');
    expect(tooltip('plain')).not.toHaveAttribute('tabindex');
    expect(panel('plain')).toHaveClass('su-tooltip-panel-icon');

    icon.click();
    await settle();
    const close = panel('plain').querySelector<HTMLButtonElement>('.su-tooltip-close')!;
    expect(icon).toHaveAttribute('aria-expanded', 'true');
    expect(close).toHaveAttribute('aria-label', 'Close');
    expect(close.ownerDocument.activeElement).toBe(close);

    close.click();
    await settle();
    expect(fixture.componentInstance.open()).toBe(false);
    expect(icon.ownerDocument.activeElement).toBe(icon);
  });

  it('with the icon on hover, stays closed after its close button puts focus back on the icon', async () => {
    const { tooltip, panel, settle, fixture } = await render(host => {
      host.trigger.set('icon');
      host.openOn.set('hover');
      host.open.set(true);
    });
    const icon = tooltip('plain').querySelector<HTMLButtonElement>('.su-tooltip-icon')!;
    const close = panel('plain').querySelector<HTMLButtonElement>('.su-tooltip-close')!;
    close.focus();

    close.click();
    await settle();

    expect(icon.ownerDocument.activeElement).toBe(icon);
    expect(fixture.componentInstance.open()).toBe(false);
  });

  it('lets the pointer through an icon tooltip on hover unless it is interactive; click ones always take it', async () => {
    const { panel, settle, fixture } = await render(host => {
      host.trigger.set('icon');
      host.openOn.set('hover');
    });
    expect(panel('plain')).not.toHaveClass('su-tooltip-interactive');

    fixture.componentInstance.openOn.set('click');
    await settle();
    expect(panel('plain')).toHaveClass('su-tooltip-interactive');
  });

  it('shows your own icon, a text or a template, in the button and the close button', async () => {
    const { tooltip } = await render();

    expect(tooltip('letter').querySelector('.su-tooltip-icon')).toHaveTextContent('i');
    expect(tooltip('letter').querySelector('.su-tooltip-glyph-icon')).toHaveTextContent('i');
    expect(tooltip('custom').querySelector('.su-tooltip-icon svg.star')).not.toBeNull();
    expect(tooltip('custom').querySelector('.su-tooltip-glyph-icon svg.star')).not.toBeNull();
    expect(tooltip('plain').querySelector('.su-tooltip-icon')).toBeNull();
  });

  it('does not open while disabled, and closes when disabled', async () => {
    const { tooltip, settle, fixture } = await render(host => host.open.set(true));

    fixture.componentInstance.disabled.set(true);
    await settle();
    expect(fixture.componentInstance.open()).toBe(false);

    tooltip('plain').dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await settle();
    expect(fixture.componentInstance.open()).toBe(false);
  });
});
