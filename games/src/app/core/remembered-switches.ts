import { signal } from '@angular/core';
import { readStored, writeStored } from './site-storage';

export class RememberedSwitches<K extends string> {
  private readonly values = signal<ReadonlyMap<K, boolean>>(new Map());
  private hasRead = false;
  private hasStored = false;

  readonly all = this.values.asReadonly();

  constructor(
    private readonly storageName: string,
    private readonly isKey: (value: unknown) => value is K,
  ) {}

  get wasStored(): boolean {
    return this.hasStored;
  }

  restore(): void {
    if (this.hasRead) {
      return;
    }
    this.hasRead = true;
    const stored = readStored(this.storageName);
    if (!Array.isArray(stored)) {
      return;
    }
    this.hasStored = true;
    this.values.set(
      new Map(
        stored.flatMap((pair: unknown): [K, boolean][] =>
          Array.isArray(pair) && this.isKey(pair[0]) && typeof pair[1] === 'boolean' ? [[pair[0], pair[1]]] : [],
        ),
      ),
    );
  }

  set(key: K, open: boolean): void {
    this.values.update((switches) => new Map(switches).set(key, open));
  }

  replace(switches: ReadonlyMap<K, boolean>): void {
    this.values.set(switches);
    writeStored(this.storageName, [...switches]);
  }
}
