import '@angular/compiler';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { SuSelectOption } from '@su-labs/core/select';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { SuSelectComponent } from '../../../../../../dist/su-labs/select/fesm2022/su-labs-select.mjs';

const SIZES: readonly SuSelectOption<string>[] = [
  { value: 's', label: 'Small', group: 'Common' },
  { value: 'm', label: 'Medium', group: 'Common' },
  { value: 'l', label: 'Large', disabled: true },
  { value: 'xl', label: 'Extra large' },
];

@Component({
  imports: [SuSelectComponent],
  template: `
    <label for="size">Size</label>
    <su-lib-select
      [options]="options"
      [searchable]="searchable()"
      [disabled]="disabled()"
      [labels]="{ placeholder: 'Elige…', empty: 'Nada' }"
      [(value)]="value"
      [(open)]="open"
      [(touched)]="touched"
      (chosen)="chosen.push($event)" />
    <button type="button" id="outside">Outside</button>
  `,
})
class HostComponent {
  readonly options = SIZES;
  readonly value = signal<string | null>(null);
  readonly open = signal(false);
  readonly touched = signal(false);
  readonly searchable = signal(false);
  readonly disabled = signal(false);
  readonly chosen: string[] = [];
}

async function render(setup: (host: HostComponent) => void = () => undefined) {
  const fixture = TestBed.createComponent(HostComponent);
  setup(fixture.componentInstance);
  await fixture.whenStable();
  const element: HTMLElement = fixture.nativeElement;
  const trigger =
    element.querySelector<HTMLButtonElement>('.su-select-trigger')!;
  const panel = element.querySelector<HTMLElement>('.su-select-panel')!;
  const options = () => [
    ...element.querySelectorAll<HTMLElement>('[role="option"]'),
  ];
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
  };
  const press = async (key: string, target: HTMLElement = trigger) => {
    target.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
    );
    await settle();
  };
  return {
    fixture,
    host: fixture.componentInstance,
    element,
    trigger,
    panel,
    options,
    settle,
    press,
  };
}

describe('SuSelectComponent', () => {
  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
  });

  afterEach(() => TestBed.resetTestingModule());

  it('shows the placeholder on a closed combobox that controls the listbox', async () => {
    const { trigger, panel, element } = await render();
    const list = element.querySelector('[role="listbox"]')!;

    expect(trigger).toHaveAttribute('role', 'combobox');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-controls', list.id);
    expect(trigger).toHaveTextContent('Elige…');
    expect(panel).not.toHaveClass('su-select-shown');
  });

  it('lists groups with their headings and marks disabled options', async () => {
    const { element, options } = await render();
    const group = element.querySelector('[role="group"]')!;

    expect(group).toHaveAccessibleName('Common');
    expect(group.querySelectorAll('[role="option"]')).toHaveLength(2);
    expect(options()[2]).toHaveAttribute('aria-disabled', 'true');
  });

  it('opens on click and chooses an option with the pointer', async () => {
    const { host, trigger, panel, options, settle } = await render();

    trigger.click();
    await settle();
    expect(host.open()).toBe(true);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(panel).toHaveClass('su-select-shown');

    options()[1].click();
    await settle();
    expect(host.value()).toBe('m');
    expect(host.open()).toBe(false);
    expect(trigger).toHaveTextContent('Medium');
  });

  it('moves with the arrows over disabled options and chooses with Enter', async () => {
    const { host, trigger, options, press } = await render(component =>
      component.value.set('m')
    );

    await press('ArrowDown');
    expect(trigger).toHaveAttribute('aria-activedescendant', options()[1].id);
    expect(options()[1]).toHaveAttribute('aria-selected', 'true');

    await press('ArrowDown');
    expect(trigger).toHaveAttribute('aria-activedescendant', options()[3].id);
    await press('Home');
    expect(trigger).toHaveAttribute('aria-activedescendant', options()[0].id);
    await press('End');
    await press('Enter');

    expect(host.value()).toBe('xl');
    expect(host.open()).toBe(false);
    expect(host.chosen).toEqual(['xl']);
  });

  it('closes on Escape without changing the value', async () => {
    const { host, press } = await render(component => component.value.set('s'));

    await press(' ');
    await press('ArrowDown');
    await press('Escape');

    expect(host.open()).toBe(false);
    expect(host.value()).toBe('s');
  });

  it('chooses by type-ahead while closed', async () => {
    const { host, press } = await render();

    await press('e');

    expect(host.value()).toBe('xl');
  });

  it('filters with the search field, which takes over the active option', async () => {
    const { host, element, options, press, settle } = await render(component =>
      component.searchable.set(true)
    );

    await press('ArrowDown');
    const search =
      element.querySelector<HTMLInputElement>('.su-select-search')!;
    search.value = 'lar';
    search.dispatchEvent(new Event('input'));
    await settle();

    expect(options().map(option => option.textContent?.trim())).toEqual([
      'Large',
      'Extra large',
    ]);
    expect(search).toHaveAttribute('aria-activedescendant', options()[1].id);

    search.value = 'zzz';
    search.dispatchEvent(new Event('input'));
    await settle();
    expect(element.querySelector('.su-select-empty')).toHaveTextContent('Nada');

    search.value = '';
    search.dispatchEvent(new Event('input'));
    await settle();
    await press('Enter', search);
    expect(host.value()).toBe('s');
  });

  it('closes and is marked touched when focus leaves', async () => {
    const { host, element, trigger, press } = await render();

    await press('ArrowDown');
    trigger.dispatchEvent(
      new FocusEvent('focusout', {
        bubbles: true,
        relatedTarget: element.querySelector('#outside'),
      })
    );

    expect(host.open()).toBe(false);
    expect(host.touched()).toBe(true);
  });

  it('stays open while the trigger is on screen and closes once it scrolls out of view', async () => {
    const { host, trigger, press } = await render();
    const scrollTo = (top: number) => {
      trigger.getBoundingClientRect = () => new DOMRect(0, top, 120, 36);
      window.dispatchEvent(new Event('scroll'));
    };

    await press('ArrowDown');
    scrollTo(200);
    expect(host.open()).toBe(true);

    scrollTo(-40);
    expect(host.open()).toBe(false);
  });

  it('follows value and open set from outside, and stays closed while disabled', async () => {
    const { host, trigger, settle } = await render();

    host.value.set('s');
    host.open.set(true);
    await settle();
    expect(trigger).toHaveTextContent('Small');
    expect(host.chosen).toEqual([]);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    host.disabled.set(true);
    await settle();
    expect(host.open()).toBe(false);
    expect(trigger).toBeDisabled();
  });
});
