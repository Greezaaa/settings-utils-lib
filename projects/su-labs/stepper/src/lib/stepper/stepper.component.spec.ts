import '@angular/compiler';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { SuStepComponent, SuStepperComponent } from '../../../../../../dist/su-labs/stepper/fesm2022/su-labs-stepper.mjs';

@Component({
  imports: [SuStepComponent, SuStepperComponent],
  template: `
    <su-lib-stepper label="Sign up" [tabs]="tabs()" [(current)]="current">
      <su-lib-step label="Account" [canNext]="named()"><p>Name</p></su-lib-step>
      <su-lib-step [completed]="addressDone()"><p>Address</p></su-lib-step>
      <su-lib-step label="Confirm" [canBack]="false"
        ><p>Confirm</p></su-lib-step
      >
    </su-lib-stepper>
  `,
})
class HostComponent {
  readonly tabs = signal(false);
  readonly named = signal(false);
  readonly current = signal(0);
  readonly addressDone = signal(false);
}

async function render(setup: (host: HostComponent) => void = () => undefined) {
  const fixture = TestBed.createComponent(HostComponent);
  setup(fixture.componentInstance);
  await fixture.whenStable();
  const element: HTMLElement = fixture.nativeElement;
  const panels = () =>
    Array.from(element.querySelectorAll<HTMLElement>('su-lib-step'));
  const button = (name: string) =>
    Array.from(
      element.querySelectorAll<HTMLButtonElement>('.su-stepper-button')
    ).find(item => item.textContent?.trim() === name);
  return { fixture, element, panels, button };
}

describe('SuStepperComponent', () => {
  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
  });

  afterEach(() => TestBed.resetTestingModule());

  it('lists the steps with their numbers and labels, and shows only the current one', async () => {
    const { element, panels } = await render();
    const items = Array.from(element.querySelectorAll('li'));

    expect(element.querySelector('ol')).toHaveAttribute(
      'aria-label',
      'Sign up'
    );
    expect(
      items.map(item =>
        item.querySelector('.su-stepper-marker')?.textContent?.trim()
      )
    ).toEqual(['1', '2', '3']);
    expect(items[0]).toHaveAttribute('aria-current', 'step');
    expect(items[1]?.querySelector('.su-stepper-label')).toBeNull();
    expect(items[0]).toHaveTextContent('Step 1 of 3, Account');
    expect(panels().map(panel => panel.hidden)).toEqual([false, true, true]);
    expect(panels()[0]).toHaveAttribute('role', 'group');
    expect(panels()[0]).toHaveAttribute(
      'aria-labelledby',
      items[0]?.querySelector('.su-stepper-header')?.id
    );
  });

  it('shows a step marked completed as completed before it is visited', async () => {
    const { element } = await render(host => host.addressDone.set(true));
    const items = Array.from(element.querySelectorAll('li'));

    expect(items.map(item => item.classList.contains('is-completed'))).toEqual([
      false,
      true,
      false,
    ]);
  });

  it('blocks Next until the step allows going forward, then moves focus to the new step', async () => {
    const { fixture, element, panels, button } = await render();

    expect(button('Next')).toHaveAttribute('aria-disabled', 'true');
    button('Next')?.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.current()).toBe(0);

    fixture.componentInstance.named.set(true);
    await fixture.whenStable();
    expect(button('Next')).not.toHaveAttribute('aria-disabled');
    button('Next')?.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.current()).toBe(1);
    expect(panels()[1]?.hidden).toBe(false);
    expect(document.activeElement).toBe(panels()[1]);
    expect(element.querySelectorAll('li')[0]).toHaveTextContent('Completed');
  });

  it('follows the current step set from outside, and a step that doesn’t allow going back', async () => {
    const { button } = await render(host => host.current.set(2));

    expect(button('Next')).toBeUndefined();
    expect(button('Back')).toHaveAttribute('aria-disabled', 'true');
  });

  it('acts as tabs, following the rules', async () => {
    const { fixture, element, panels } = await render(host =>
      host.tabs.set(true)
    );
    const tabs = () =>
      Array.from(element.querySelectorAll<HTMLButtonElement>('[role="tab"]'));

    expect(element.querySelector('ol')).toHaveAttribute('role', 'tablist');
    expect(element.querySelector('ol')).toHaveAttribute(
      'aria-orientation',
      'horizontal'
    );
    expect(panels()[0]).toHaveAttribute('role', 'tabpanel');
    expect(tabs()[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs()[0]).toHaveAttribute('aria-controls', panels()[0]?.id);
    expect(tabs().map(tab => tab.tabIndex)).toEqual([0, -1, -1]);
    expect(tabs()[1]).toHaveAttribute('aria-disabled', 'true');

    tabs()[1]?.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.current()).toBe(0);

    fixture.componentInstance.named.set(true);
    await fixture.whenStable();
    tabs()[2]?.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.current()).toBe(2);
    expect(tabs()[2]).toHaveAttribute('aria-selected', 'true');
    expect(tabs()[0]).toHaveAttribute('aria-disabled', 'true');
  });

  it('moves focus between tabs with the arrow keys, Home and End', async () => {
    const { element } = await render(host => host.tabs.set(true));
    const tabs = Array.from(
      element.querySelectorAll<HTMLButtonElement>('[role="tab"]')
    );
    const press = (key: string) =>
      document.activeElement?.dispatchEvent(
        new KeyboardEvent('keydown', { key, bubbles: true })
      );

    tabs[0]?.focus();
    press('ArrowRight');
    expect(document.activeElement).toBe(tabs[1]);
    press('End');
    expect(document.activeElement).toBe(tabs[2]);
    press('ArrowRight');
    expect(document.activeElement).toBe(tabs[0]);
    press('ArrowLeft');
    expect(document.activeElement).toBe(tabs[2]);
    press('Home');
    expect(document.activeElement).toBe(tabs[0]);
  });
});
