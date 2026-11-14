import '@angular/compiler';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { SuSwitchComponent } from '../../../../../../dist/su-labs/fields/fesm2022/su-labs-fields.mjs';

@Component({
  imports: [SuSwitchComponent],
  template: `
    <su-lib-switch [(checked)]="on">Reduce motion</su-lib-switch>
    <su-lib-switch labelPosition="start" size="small" disabled>Locked</su-lib-switch>
    <su-lib-switch [checked]="saved()" [busy]="saving()" (checkedChange)="save($event)">Saved</su-lib-switch>
  `,
})
class HostComponent {
  readonly on = signal(false);
  readonly saved = signal(false);
  readonly saving = signal(false);
  readonly requests: boolean[] = [];

  save(value: boolean): void {
    this.requests.push(value);
    this.saving.set(true);
  }
}

describe('SuSwitchComponent', () => {
  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
  });

  afterEach(() => TestBed.resetTestingModule());

  it('is a labelled checkbox with the switch role, bound both ways', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const [input] = fixture.nativeElement.querySelectorAll('input');

    expect(input.getAttribute('role')).toBe('switch');
    expect(input.closest('label').textContent.trim()).toBe('Reduce motion');
    expect(input.checked).toBe(false);

    input.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.on()).toBe(true);

    fixture.componentInstance.on.set(false);
    await fixture.whenStable();
    expect(input.checked).toBe(false);
  });

  it('puts the label first and can be disabled', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const label = fixture.nativeElement.querySelectorAll('label')[1];

    expect(label.classList).toContain('is-label-start');
    expect(label.classList).toContain('su-switch-small');
    expect(label.querySelector('input').disabled).toBe(true);
  });

  it('ignores clicks while busy, and shows the saved value once done', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelectorAll('input')[2];
    const host = fixture.componentInstance;

    input.click();
    await fixture.whenStable();
    expect(host.requests).toEqual([true]);
    expect(input.checked).toBe(true);

    input.click();
    await fixture.whenStable();
    expect(host.requests).toEqual([true]);
    expect(input.checked).toBe(true);

    host.saving.set(false);
    await fixture.whenStable();
    expect(input.checked).toBe(false);
  });
});
