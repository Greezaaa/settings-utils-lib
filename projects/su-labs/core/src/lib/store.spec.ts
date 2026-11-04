import { describe, expect, it, vi } from 'vitest';
import { createSuStore } from './store';

describe('createSuStore', () => {
  it('should return the initial value', () => {
    const store = createSuStore(1);
    expect(store.get()).toBe(1);
  });

  it('should call a new subscriber immediately with the current value', () => {
    const store = createSuStore('a');
    const listener = vi.fn();
    store.subscribe(listener);
    expect(listener).toHaveBeenCalledExactlyOnceWith('a');
  });

  it('should notify subscribers when the value changes', () => {
    const store = createSuStore(1);
    const listener = vi.fn();
    store.subscribe(listener);
    store.set(2);
    expect(store.get()).toBe(2);
    expect(listener).toHaveBeenLastCalledWith(2);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('should not notify subscribers when the value is unchanged', () => {
    const store = createSuStore(1);
    const listener = vi.fn();
    store.subscribe(listener);
    store.set(1);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should stop notifying after unsubscribe', () => {
    const store = createSuStore(1);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.set(2);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should expose a read-only view that follows the store', () => {
    const store = createSuStore(1);
    const readonlyStore = store.asReadonly();
    store.set(5);
    expect(readonlyStore.get()).toBe(5);
    expect('set' in readonlyStore).toBe(false);
  });
});
