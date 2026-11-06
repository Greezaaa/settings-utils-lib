import { format } from 'prettier';
import { joinImports } from './join-imports.ts';
import type { ParserName } from './parser-name.ts';
import { ProjectPluginError, resolveProjectPrettier } from './project-prettier.ts';

/** A document to format */
export interface DocumentToFormat {
  readonly text: string;
  readonly parser: ParserName;
  /** Path on disk; `undefined` for unsaved documents, which only get their imports joined */
  readonly filePath?: string;
}

/** What was done to a document */
export interface FormatResult {
  /** The new text, or `null` when it stays as it is */
  readonly text: string | null;
  /** `prettier`: formatted with the project's config; `imports-only`: only imports joined; `ignored`: in `.prettierignore` */
  readonly mode: 'prettier' | 'imports-only' | 'ignored';
  /** Why the project's Prettier config wasn't used even though it has one */
  readonly warning?: string;
}

/** Joins the imports only, leaving the rest of the code as it is */
async function joinImportsOnly(document: DocumentToFormat, warning?: string): Promise<FormatResult> {
  const text = await joinImports(document.text, document.parser, document.filePath);
  return { text, mode: 'imports-only', warning };
}

/**
 * Formats a document the way its project does, with every import on one line:
 * with the project's Prettier config when it uses Prettier, otherwise by joining the imports only.
 *
 * @throws when the code can't be parsed
 */
export async function formatDocument(document: DocumentToFormat): Promise<FormatResult> {
  const { filePath } = document;
  if (!filePath) return joinImportsOnly(document);

  try {
    const project = await resolveProjectPrettier(filePath);
    if (project.kind === 'none') return joinImportsOnly(document);
    if (project.kind === 'ignored') return { text: null, mode: 'ignored' };

    // A parser set in the project's config (overrides included) wins over the language's default
    const formatted = await format(document.text, { parser: document.parser, ...project.options, filepath: filePath });
    return { text: formatted === document.text ? null : formatted, mode: 'prettier' };
  } catch (error) {
    if (error instanceof ProjectPluginError) return joinImportsOnly(document, error.message);
    throw error;
  }
}
