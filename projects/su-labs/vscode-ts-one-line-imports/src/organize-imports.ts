import * as vscode from 'vscode';
import { applyReplacements } from './apply-replacements.ts';
import { importActionKind } from './import-action-kind.ts';
import type { ImportSettings } from './import-action-kind.ts';

/** Resolve the action's edit too, which VS Code may otherwise compute only when the action is applied */
const RESOLVE_FIRST_ACTION = 1;

/**
 * The document's text with its imports sorted and/or unused ones removed, as VS Code's own
 * **Sort Imports**, **Remove Unused Imports** or **Organize Imports** command would leave it.
 * Uses VS Code's built-in TypeScript language service, so the project's `tsconfig.json` is respected.
 *
 * @returns the new text; the same text when nothing changes or the language service isn't ready
 */
export async function organizeImports(document: vscode.TextDocument, settings: ImportSettings): Promise<string> {
  const text = document.getText();
  const kind = importActionKind(settings);
  if (!kind) return text;

  const wholeDocument = new vscode.Range(document.positionAt(0), document.positionAt(text.length));
  const actions = await vscode.commands.executeCommand<vscode.CodeAction[] | undefined>(
    'vscode.executeCodeActionProvider',
    document.uri,
    wholeDocument,
    kind,
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
