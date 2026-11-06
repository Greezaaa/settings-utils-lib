import { doc } from 'prettier';
import type { AstPath, Doc, Parser, ParserOptions, Plugin, Printer } from 'prettier';
import { parsers as babelParsers } from 'prettier/plugins/babel';
import { printers as estreePrinters } from 'prettier/plugins/estree';
import { parsers as typescriptParsers } from 'prettier/plugins/typescript';

/** The part of an AST node this plugin reads */
interface AstNode {
  readonly type: string;
}

/** AST format of the parsers below, so they use this plugin's printer instead of the default one */
const AST_FORMAT = 'estree-single-line-imports';

/** Prettier's own printer for JavaScript and TypeScript */
const estreePrinter: Printer<AstNode> = estreePrinters.estree;

/** String literals, removed before looking for comments so `'//cdn.example'` doesn't count as one */
const STRING_LITERALS = /(['"`])(?:\\.|(?!\1).)*\1/g;

/** Comment markers in source text */
const COMMENT = /\/\/|\/\*/;

/**
 * An import with a comment inside must keep its line breaks:
 * on a single line, a `//` comment would comment out the rest of the import.
 */
function containsComment(node: AstNode, options: ParserOptions<AstNode>): boolean {
  const source = options.originalText.slice(options.locStart(node), options.locEnd(node));
  return COMMENT.test(source.replace(STRING_LITERALS, ''));
}

/**
 * Prints every node like Prettier does, except import declarations,
 * which always stay on one line regardless of `printWidth`.
 */
const singleLineImportsPrinter: Printer<AstNode> = {
  ...estreePrinter,
  print(path: AstPath<AstNode>, options: ParserOptions<AstNode>, print: (path: AstPath<AstNode>) => Doc, args?: unknown): Doc {
    const printed = estreePrinter.print(path, options, print, args);
    const { node } = path;
    return node.type === 'ImportDeclaration' && !containsComment(node, options) ? doc.utils.removeLines(printed) : printed;
  },
};

/** Prettier's parser, switched to this plugin's printer */
const withSingleLineImports = (parser: Parser<AstNode>): Parser<AstNode> => ({ ...parser, astFormat: AST_FORMAT });

/** Parsers whose output gets single-line imports: TypeScript and JavaScript */
export const parsers: Plugin<AstNode>['parsers'] = {
  typescript: withSingleLineImports(typescriptParsers.typescript),
  'babel-ts': withSingleLineImports(babelParsers['babel-ts']),
  babel: withSingleLineImports(babelParsers.babel),
};

export const printers: Plugin<AstNode>['printers'] = {
  [AST_FORMAT]: singleLineImportsPrinter,
};

const plugin: Plugin<AstNode> = { parsers, printers };

export default plugin;
