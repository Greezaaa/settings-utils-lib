import * as vscode from 'vscode';
import { formatDocument } from './format-document.ts';
import type { ParserName } from './parser-name.ts';
import { clearProjectPrettierCache } from './project-prettier.ts';
import type { ImportSettings } from './import-action-kind.ts';
import { organizeImports } from './organize-imports.ts';

/** Section of this extension's settings */
const SETTINGS_SECTION = 'tsOneLineImports';

/** Languages this extension formats, with the Prettier parser for each */
const LANGUAGE_PARSERS: Readonly<Record<string, ParserName>> = {
  typescript: 'typescript',
  typescriptreact: 'typescript',
  javascript: 'babel',
  javascriptreact: 'babel',
};

/** Files whose changes can change how a project is formatted */
const CONFIG_FILES = '**/{.prettierrc,.prettierrc.*,prettier.config.*,.prettierignore,.editorconfig,package.json}';

/** Replaces the whole document with the formatted text */
const replaceAll = (document: vscode.TextDocument, text: string): vscode.TextEdit =>
  vscode.TextEdit.replace(new vscode.Range(document.positionAt(0), document.positionAt(document.getText().length)), text);

/** The user's import settings for this document */
function importSettings(document: vscode.TextDocument): ImportSettings {
  const settings = vscode.workspace.getConfiguration(SETTINGS_SECTION, document);
  return {
    sortImports: settings.get<boolean>('sortImports', false),
    removeUnusedImports: settings.get<boolean>('removeUnusedImports', false),
  };
}

/** Creates the formatter, which logs what it did to an output channel */
function createFormatter(output: vscode.LogOutputChannel): vscode.DocumentFormattingEditProvider {
  return {
    async provideDocumentFormattingEdits(document) {
      const parser = LANGUAGE_PARSERS[document.languageId];
      if (!parser) return [];
      const filePath = document.uri.scheme === 'file' ? document.uri.fsPath : undefined;
      try {
        const original = document.getText();
        const text = await organizeImports(document, importSettings(document));
        const result = await formatDocument({ text, parser, filePath });
        if (result.warning) output.warn(result.warning);
        output.info(`${result.mode}: ${filePath ?? document.uri.toString()}`);
        // A file in .prettierignore isn't touched at all, its imports included
        if (result.mode === 'ignored') return [];
        const formatted = result.text ?? text;
        return formatted === original ? [] : [replaceAll(document, formatted)];
      } catch (error) {
        // Usually a syntax error while typing: leave the file as it is
        output.error(`${filePath ?? document.uri.toString()}: ${error instanceof Error ? error.message : String(error)}`);
        return [];
      }
    },
  };
}

export function activate(context: vscode.ExtensionContext): void {
  const output = vscode.window.createOutputChannel('TS One-Line Imports', { log: true });
  const configWatcher = vscode.workspace.createFileSystemWatcher(CONFIG_FILES);
  const clearCache = (): void => void clearProjectPrettierCache();
  const selector = Object.keys(LANGUAGE_PARSERS).map((language) => ({ language }));

  context.subscriptions.push(
    output,
    configWatcher,
    configWatcher.onDidChange(clearCache),
    configWatcher.onDidCreate(clearCache),
    configWatcher.onDidDelete(clearCache),
    vscode.languages.registerDocumentFormattingEditProvider(selector, createFormatter(output))
  );
}

export function deactivate(): void {}
