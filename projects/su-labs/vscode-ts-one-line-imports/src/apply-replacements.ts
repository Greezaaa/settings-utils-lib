/** A change to a text: the characters from `start` to `end` become `newText` */
export interface TextReplacement {
  readonly start: number;
  readonly end: number;
  readonly newText: string;
}

/**
 * Applies replacements that don't overlap, all given as offsets in the original text.
 *
 * @returns the changed text
 */
export function applyReplacements(text: string, replacements: readonly TextReplacement[]): string {
  // From the last to the first, so earlier offsets stay valid after each replacement
  const lastFirst = [...replacements].sort((a, b) => b.start - a.start);
  return lastFirst.reduce((result, { start, end, newText }) => result.slice(0, start) + newText + result.slice(end), text);
}
