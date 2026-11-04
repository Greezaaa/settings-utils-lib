/** Callback invoked with the store's current value */
export type SuStoreListener<T> = (value: T) => void;

/** Function returned by `subscribe` that stops the subscription */
export type SuUnsubscribe = () => void;

/**
 * Read-only reactive value.
 *
 * `subscribe` calls the listener immediately with the current value and again on every change,
 * which matches the Svelte store contract and works with React's `useSyncExternalStore`.
 */
export interface SuReadableStore<T> {
  /** Get the current value */
  get(): T;

  /**
   * Listen to value changes.
   * @param listener Called immediately with the current value, then on every change.
   * @returns Function that removes the listener.
   */
  subscribe(listener: SuStoreListener<T>): SuUnsubscribe;
}

/** Reactive value that can be updated */
export interface SuWritableStore<T> extends SuReadableStore<T> {
  /**
   * Replace the current value and notify listeners if it changed.
   * @param value The new value.
   */
  set(value: T): void;

  /** Read-only view of this store, safe to expose publicly */
  asReadonly(): SuReadableStore<T>;
}

/**
 * Create a minimal reactive store with no framework dependencies.
 * @param initialValue The starting value.
 * @returns A writable store.
 */
export function createSuStore<T>(initialValue: T): SuWritableStore<T> {
  let value = initialValue;
  const listeners = new Set<SuStoreListener<T>>();

  const readonlyStore: SuReadableStore<T> = {
    get: () => value,
    subscribe: (listener) => {
      listeners.add(listener);
      listener(value);
      return () => listeners.delete(listener);
    },
  };

  return {
    ...readonlyStore,
    set: (nextValue) => {
      if (Object.is(nextValue, value)) {
        return;
      }
      value = nextValue;
      listeners.forEach((listener) => listener(value));
    },
    asReadonly: () => readonlyStore,
  };
}
