import { describe, expect, it } from 'vitest';
import { SuSelectController } from './select.controller';
import { suSelectFilter, suSelectGroups } from './select.options';
import { SuSelectOption } from './select.types';

const FRUITS: readonly SuSelectOption<string>[] = [
  { value: 'apple', label: 'Apple', group: 'Pome' },
  { value: 'pear', label: 'Pear', group: 'Pome', disabled: true },
  { value: 'apricot', label: 'Apricot', group: 'Stone' },
  { value: 'cherry', label: 'Cherry', group: 'Stone' },
  { value: 'avocado', label: 'Ávocado' },
];

const create = (value: string | null = null) =>
  new SuSelectController<string>({ options: FRUITS, value });
const activeValue = (select: SuSelectController<string>) => {
  const { visible, active } = select.state.get();
  return visible[active]?.value;
};

describe('SuSelectController', () => {
  it('opens on the chosen option, or else on the first one that can be chosen', () => {
    const chosen = create('cherry');
    chosen.open();
    expect(chosen.state.get().open).toBe(true);
    expect(activeValue(chosen)).toBe('cherry');

    const empty = create();
    empty.open();
    expect(activeValue(empty)).toBe('apple');
  });

  it('moves over disabled options and stops at either end', () => {
    const select = create();
    select.open();

    select.move('next');
    expect(activeValue(select)).toBe('apricot');
    select.move('last');
    expect(activeValue(select)).toBe('avocado');
    select.move('next');
    expect(activeValue(select)).toBe('avocado');
    select.move('first');
    select.move('previous');
    expect(activeValue(select)).toBe('apple');
  });

  it('chooses the active option and closes, but never a disabled one', () => {
    const select = create();
    select.open();
    select.move('next');

    expect(select.choose()).toBe(true);
    expect(select.state.get()).toMatchObject({
      open: false,
      value: 'apricot',
      active: -1,
    });
    expect(select.selected?.label).toBe('Apricot');

    select.open();
    expect(select.choose(1)).toBe(false);
    select.activate(1);
    expect(activeValue(select)).toBe('apricot');
  });

  it('filters by the search text ignoring case and accents, and clears it on close', () => {
    const select = create();
    select.open();

    select.search('av');
    expect(select.state.get().visible.map(option => option.value)).toEqual([
      'avocado',
    ]);
    expect(activeValue(select)).toBe('avocado');

    select.search('zzz');
    expect(select.state.get().active).toBe(-1);
    expect(select.choose()).toBe(false);

    select.close();
    expect(select.state.get()).toMatchObject({ query: '', visible: FRUITS });
  });

  it('type-ahead cycles through options starting with a repeated letter and matches whole words', () => {
    const select = create();
    select.open();

    select.typeAhead('a', 0);
    expect(activeValue(select)).toBe('apricot');
    select.typeAhead('a', 100);
    expect(activeValue(select)).toBe('avocado');
    select.typeAhead('c', 1000);
    expect(activeValue(select)).toBe('cherry');
    select.typeAhead('a', 2000);
    select.typeAhead('p', 2100);
    select.typeAhead('p', 2200);
    expect(activeValue(select)).toBe('apple');
    expect(select.typeAhead('x', 5000)).toBe(false);
  });

  it('type-ahead while closed chooses the option, like a native select', () => {
    const select = create('apple');

    select.typeAhead('c', 0);

    expect(select.state.get()).toMatchObject({ open: false, value: 'cherry' });
  });

  it('keeps the active option when the options change, and sets the value from outside', () => {
    const select = create();
    select.open();
    select.move('last');

    select.setOptions([{ value: 'kiwi', label: 'Kiwi' }, ...FRUITS]);
    expect(activeValue(select)).toBe('avocado');

    const values: (string | null)[] = [];
    select.state.subscribe(state => values.push(state.value));
    select.setValue('pear');
    select.setValue('pear');
    expect(values).toEqual([null, 'pear']);
  });

  it('compares values with the given function', () => {
    const select = new SuSelectController<{ id: number }>({
      options: [{ value: { id: 1 }, label: 'One' }],
      value: { id: 1 },
      compare: (a, b) => a.id === b.id,
    });

    expect(select.selected?.label).toBe('One');
  });
});

describe('suSelectGroups', () => {
  it('groups consecutive options and keeps their indexes', () => {
    const groups = suSelectGroups(suSelectFilter(FRUITS, 'a'));

    expect(groups).toEqual([
      {
        label: 'Pome',
        options: [
          { option: FRUITS[0], index: 0 },
          { option: FRUITS[1], index: 1 },
        ],
      },
      { label: 'Stone', options: [{ option: FRUITS[2], index: 2 }] },
      { label: undefined, options: [{ option: FRUITS[4], index: 3 }] },
    ]);
  });
});
