import { SuTableEditor, SuTableInputAttributes, SuTableInputValue } from './table.types';

const asText = (input: SuTableInputValue): string => (typeof input === 'string' ? input : '');

/** Options of the text editors */
export interface SuTextEditorOptions extends SuTableInputAttributes {
  /** @default 'text' */
  readonly input?: 'text' | 'email' | 'textarea';
  /** A message when the text is empty; without it, empty text is allowed */
  readonly requiredMessage?: string;
}

/** A text field, kept as it was typed but trimmed */
export function suTextEditor(options: SuTextEditorOptions = {}): SuTableEditor<string> {
  const { input = 'text', requiredMessage, ...attributes } = options;
  return {
    input,
    attributes,
    toInput: (value) => value,
    parse: (value) => asText(value).trim(),
    validate: (value) => (requiredMessage && value === '' ? requiredMessage : null),
  };
}

/** Options of `suNumberEditor` */
export interface SuNumberEditorOptions extends Pick<SuTableInputAttributes, 'step' | 'placeholder'> {
  readonly min?: number;
  readonly max?: number;
  /** A message when the value isn't a number within `min` and `max` @default 'Enter a number' */
  readonly invalidMessage?: string;
}

/** A number field */
export function suNumberEditor(options: SuNumberEditorOptions = {}): SuTableEditor<number> {
  const { invalidMessage = 'Enter a number', ...attributes } = options;
  const { min = -Infinity, max = Infinity } = options;
  return {
    input: 'number',
    attributes,
    toInput: (value) => String(value),
    parse: (value) => (asText(value).trim() === '' ? NaN : Number(value)),
    validate: (value) => (Number.isFinite(value) && value >= min && value <= max ? null : invalidMessage),
  };
}

/** A checkbox */
export function suCheckboxEditor(): SuTableEditor<boolean> {
  return {
    input: 'checkbox',
    toInput: (value) => value,
    parse: (value) => value === true,
  };
}

/** A date as the API's `YYYY-MM-DD` text (a longer ISO date is cut to its day) */
export function suDateEditor(attributes: Pick<SuTableInputAttributes, 'min' | 'max'> = {}): SuTableEditor<string> {
  return {
    input: 'date',
    attributes,
    toInput: (value) => value.slice(0, 10),
    parse: asText,
  };
}

/** One choice of `suSelectEditor`, keeping the API's own value type */
export interface SuSelectChoice<TValue extends string> {
  readonly value: TValue;
  readonly label: string;
}

/** A list of fixed choices, e.g. a status */
export function suSelectEditor<TValue extends string>(
  choices: readonly [SuSelectChoice<TValue>, ...SuSelectChoice<TValue>[]],
): SuTableEditor<TValue> {
  return {
    input: 'select',
    options: choices,
    toInput: (value) => value,
    parse: (value) => (choices.find((choice) => choice.value === value) ?? choices[0]).value,
  };
}
