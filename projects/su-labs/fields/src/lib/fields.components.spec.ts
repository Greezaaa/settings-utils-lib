import '@angular/compiler';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { SuCheckboxComponent, SuChipOption, SuChipsComponent, SuEmailFieldComponent } from '../../../../../dist/su-labs/fields/fesm2022/su-labs-fields.mjs';

type Category = 'tools' | 'garden' | 'kitchen';

@Component({
  imports: [SuCheckboxComponent, SuChipsComponent, SuEmailFieldComponent],
  template: `
    <su-lib-email-field label="Email" required [(value)]="email" (validityChange)="valid.set($event)" />
    <su-lib-checkbox [(checked)]="agree">I agree</su-lib-checkbox>
    <su-lib-checkbox indeterminate>Some</su-lib-checkbox>
    <su-lib-chips label="Categories" [options]="categories" [(value)]="picked" />
    <su-lib-chips label="One" [multiple]="false" [options]="categories" [(value)]="single" />
  `,
})
class HostComponent {
  readonly email = signal('');
  readonly valid = signal(false);
  readonly agree = signal(false);
  readonly categories: readonly SuChipOption<Category>[] = [
    { value: 'tools', label: 'Tools' },
    { value: 'garden', label: 'Garden' },
    { value: 'kitchen', label: 'Kitchen', disabled: true },
  ];
  readonly picked = signal<readonly Category[]>([]);
  readonly single = signal<readonly Category[]>(['tools']);
}

describe('fields components', () => {
  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
  });

  afterEach(() => TestBed.resetTestingModule());

  const render = async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    return { fixture, element, host: fixture.componentInstance, settle: () => fixture.whenStable() };
  };

  it('email field: quiet while typing, says what’s wrong once left, and applies a suggestion', async () => {
    const { element, host, settle } = await render();
    const input = element.querySelector<HTMLInputElement>('input[type="email"]');
    if (!input) {
      throw new Error('No email input');
    }
    expect(element.querySelector('label')?.textContent).toBe('Email');
    expect(input.getAttribute('autocomplete')).toBe('email');

    input.value = 'jo@gmial';
    input.dispatchEvent(new Event('input'));
    await settle();
    expect(input.getAttribute('aria-invalid')).toBeNull();

    input.dispatchEvent(new Event('blur'));
    await settle();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(element.querySelector('.su-email-problem')?.textContent).toContain('needs a dot');
    expect(host.valid()).toBe(false);

    input.value = 'jo@gmial.com';
    input.dispatchEvent(new Event('input'));
    await settle();
    const fix = element.querySelector<HTMLButtonElement>('.su-email-fix');
    expect(fix?.textContent).toBe('jo@gmail.com');
    fix?.click();
    await settle();
    expect(host.email()).toBe('jo@gmail.com');
    expect(host.valid()).toBe(true);
  });

  it('checkbox: binds both ways and shows a partly checked state', async () => {
    const { element, host, settle } = await render();
    const [agree, some] = element.querySelectorAll<HTMLInputElement>('su-lib-checkbox input');

    agree.click();
    await settle();
    expect(host.agree()).toBe(true);
    expect(some.indeterminate).toBe(true);
  });

  it('chips: toggles several in order, or picks one, and skips disabled ones', async () => {
    const { element, host, settle } = await render();
    const [many, one] = element.querySelectorAll('su-lib-chips');
    const chips = (group: Element) => [...group.querySelectorAll<HTMLButtonElement>('button')];

    expect(many.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('Categories');
    chips(many)[1].click();
    chips(many)[0].click();
    await settle();
    expect(host.picked()).toEqual(['tools', 'garden']);
    expect(chips(many)[0].getAttribute('aria-pressed')).toBe('true');
    expect(chips(many)[2].disabled).toBe(true);

    chips(many)[0].click();
    await settle();
    expect(host.picked()).toEqual(['garden']);

    chips(one)[1].click();
    await settle();
    expect(host.single()).toEqual(['garden']);
  });
});
