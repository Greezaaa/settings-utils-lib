import { parsers as babelParsers } from 'prettier/plugins/babel';
import { parsers as typescriptParsers } from 'prettier/plugins/typescript';
import { containsComment } from '../../prettier-plugin-single-line-imports/src/comments.ts';
import type { ParserName } from './parser-name.ts';

/**
 * The parts of an AST node this module reads.
 * The root is a Program with a `body` for `typescript`, and a File wrapping one in `program` for `babel`.
 */
interface AstNode {
  readonly type: string;
  readonly body?: readonly AstNode[];
  readonly program?: AstNode;
}

/** The part of a Prettier parser used here: parsing needs only the file name, not every formatting option */
interface ImportLocator {
  parse(text: string, options: { readonly filepath: string }): AstNode | Promise<AstNode>;
  locStart(node: AstNode): number;
  locEnd(node: AstNode): number;
}

/** Prettier's parsers, used only to find where each import starts and ends */
const PARSERS: Record<ParserName, ImportLocator> = {
  typescript: typescriptParsers.typescript,
  babel: babelParsers.babel,
};

/** Line breaks with the indentation around them */
const LINE_BREAK = /\s*\r?\n\s*/g;

/** A trailing comma before a closing brace, as in `{ a, b, }` */
const TRAILING_COMMA = /,\s*\}/g;

/** Braces with only spaces inside, as in `{ }` */
const EMPTY_BRACES = /\{\s+\}/g;

/** Puts an import on one line, the way Prettier prints a short one */
const joinImport = (source: string): string =>
  source.replace(LINE_BREAK, ' ').replace(TRAILING_COMMA, ' }').replace(EMPTY_BRACES, '{}');

/** Whether an import spans several lines and can safely be joined */
const canJoin = (source: string): boolean => /\r?\n/.test(source) && !containsComment(source);

/**
 * Joins every multi-line import into a single line and leaves the rest of the code untouched,
 * like TypeScript Hero did. Used for projects that don't use Prettier.
 *
 * @returns the new text, or `null` when nothing needed joining
 * @throws when the code can't be parsed
 */
export async function joinImports(text: string, parser: ParserName, filePath?: string): Promise<string | null> {
  const selectedParser = PARSERS[parser];
  // The file name tells the parser whether JSX is allowed (.tsx, .jsx)
  const parsed = await selectedParser.parse(text, { filepath: filePath ?? '' });
  const statements = parsed.body ?? parsed.program?.body ?? [];

  let result = text;
  // From the last import to the first, so earlier offsets stay valid after each replacement
  for (const node of [...statements].reverse()) {
    if (node.type !== 'ImportDeclaration') continue;
    const start = selectedParser.locStart(node);
    const end = selectedParser.locEnd(node);
    const source = text.slice(start, end);
    if (canJoin(source)) result = result.slice(0, start) + joinImport(source) + result.slice(end);
  }
  return result === text ? null : result;
}
