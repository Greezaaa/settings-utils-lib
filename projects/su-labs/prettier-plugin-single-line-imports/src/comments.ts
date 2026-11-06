/** String literals, removed before looking for comments so `'//cdn.example'` doesn't count as one */
const STRING_LITERALS = /(['"`])(?:\\.|(?!\1).)*\1/g;

/** Comment markers in source text */
const COMMENT = /\/\/|\/\*/;

/**
 * Whether a piece of source code contains a comment outside its string literals.
 * Code with a comment inside must keep its line breaks:
 * on a single line, a `//` comment would comment out the rest of it.
 */
export function containsComment(source: string): boolean {
  return COMMENT.test(source.replace(STRING_LITERALS, ''));
}
