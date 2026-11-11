/** What the user turned on for the imports, besides keeping them on one line */
export interface ImportSettings {
  readonly sortImports: boolean;
  readonly removeUnusedImports: boolean;
}

/**
 * The VS Code source action that does what the settings ask for, in one pass.
 * Only one action can run, because each one edits the document as it was before any other.
 *
 * @returns the action's kind, or `undefined` when nothing is turned on
 */
export function importActionKind({ sortImports, removeUnusedImports }: ImportSettings): string | undefined {
  if (sortImports && removeUnusedImports) return 'source.organizeImports';
  if (sortImports) return 'source.sortImports';
  if (removeUnusedImports) return 'source.removeUnusedImports';
  return undefined;
}
