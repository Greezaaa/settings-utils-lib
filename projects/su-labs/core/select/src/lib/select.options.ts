import { SuSelectGroup, SuSelectIndexedOption, SuSelectOption } from './select.types';

/** The options in groups of consecutive options sharing a `group`, each with its index among the given options */
export function suSelectGroups<T>(
  options: readonly SuSelectOption<T>[]
): readonly SuSelectGroup<T>[] {
  const groups: {
    label: string | undefined;
    options: SuSelectIndexedOption<T>[];
  }[] = [];
  options.forEach((option, index) => {
    const last = groups[groups.length - 1];
    if (last && last.label === option.group) {
      last.options.push({ option, index });
    } else {
      groups.push({ label: option.group, options: [{ option, index }] });
    }
  });
  return groups;
}

/** The options whose label contains the query, ignoring case and accents */
export function suSelectFilter<T>(
  options: readonly SuSelectOption<T>[],
  query: string
): readonly SuSelectOption<T>[] {
  const term = suSelectNormalize(query.trim());
  return term
    ? options.filter(option => suSelectNormalize(option.label).includes(term))
    : options;
}

/** Folds case and accents, so `é` matches `E` */
export function suSelectNormalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}
