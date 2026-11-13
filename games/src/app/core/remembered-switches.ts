import { readStored, writeStored } from './site-storage';

export function readSwitches<K extends string>(name: string, isKey: (value: unknown) => value is K): Map<K, boolean> | null {
  const stored = readStored(name);
  if (!Array.isArray(stored)) {
    return null;
  }
  return new Map(
    stored.flatMap((pair: unknown): [K, boolean][] =>
      Array.isArray(pair) && isKey(pair[0]) && typeof pair[1] === 'boolean' ? [[pair[0], pair[1]]] : [],
    ),
  );
}

export function writeSwitches(name: string, switches: ReadonlyMap<string, boolean>): void {
  writeStored(name, [...switches]);
}
