import { SuSelectOption } from '@su-labs/core/select';

/** Options for `su-lib-select` from a list of values, each shown as its own text unless `label` says otherwise */
export function selectOptions<T extends string | number>(
  values: readonly T[],
  label: (value: T) => string = String,
): readonly SuSelectOption<T>[] {
  return values.map((value) => ({ value, label: label(value) }));
}
