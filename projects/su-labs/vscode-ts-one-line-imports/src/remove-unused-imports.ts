import * as vscode from 'vscode';
import { applyReplacements } from './apply-replacements.ts';

/** The "Remove Unused Imports" source action of VS Code's TypeScript and JavaScript support */
const REMOVE_UNUSED_IMPORTS = vscode.CodeActionKind.Source.append('removeUnusedImports');

/** Resolve the action's edit too, which VS Code may otherwise compute only when the action is applied */
const RESOLVE_FIRST_ACTION = 1;

/**
 * The document's text without its unused imports, as VS Code's "Remove Unused Imports" command would leave it.
 * Uses VS Code's built-in TypeScript language service, so the project's `tsconfig.json` is respected.
 *
 * @returns the new text; the same text when nothing is unused or the language service isn't ready
 */
export async function removeUnusedImports(document: vscode.TextDocument): Promise<string> {
  const text = document.getText();
  const wholeDocument = new vscode.Range(document.positionAt(0), document.positionAt(text.length));
  const actions = await vscode.commands.executeCommand<vscode.CodeAction[] | undefined>(
    'vscode.executeCodeActionProvider',
    document.uri,
    wholeDocument,
    REMOVE_UNUSED_IMPORTS.value,
    RESOLVE_FIRST_ACTION
  );
  const edits = actions?.find((action) => action.edit)?.edit?.get(document.uri) ?? [];
  const replacements = edits.map((edit) => ({
    start: document.offsetAt(edit.range.start),
    end: document.offsetAt(edit.range.end),
    newText: edit.newText,
  }));
  return applyReplacements(text, replacements);
}
