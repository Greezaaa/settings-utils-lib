# TS One-Line Imports

Keeps every `import` on a single line in TypeScript and JavaScript, in every project you open, without installing anything in the projects.

```ts
// Always this
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';

// Never this
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
```

## Table of Contents

- [How It Works](#how-it-works)
- [Installation](#installation)
- [Setup](#setup)
- [Sorting and Removing Unused Imports](#sorting-and-removing-unused-imports)
- [Teams and CI](#teams-and-ci)
- [Troubleshooting](#troubleshooting)
- [Limitations](#limitations)
- [License](#license)

## How It Works

The extension is a formatter. For each file it looks at the project the file belongs to:

| The project has | What the formatter does |
|---|---|
| A Prettier config (`.prettierrc*`, `prettier.config.*`, or a `"prettier"` key in `package.json`) | Formats with that config: its options, `overrides`, `.editorconfig`, `.prettierignore` and its plugins. Imports stay on one line. |
| Prettier in its dependencies, but no config | Formats with Prettier's defaults. Imports stay on one line. |
| No Prettier | Only joins wrapped imports into one line. The rest of the code is left exactly as it is. |
| Prettier plugins in its config that aren't installed | Only joins the imports, and logs a warning to run `npm install`. |
| The file in `.prettierignore` | Nothing. |

Imports with a comment inside are left as they are, so a `//` comment can never comment out the rest of the import. Files with syntax errors are left unchanged.

Prettier 3 and [`@su-labs/prettier-plugin-single-line-imports`](https://www.npmjs.com/package/@su-labs/prettier-plugin-single-line-imports) are bundled in the extension.

## Installation

Open the Extensions view (`Cmd+Shift+X` / `Ctrl+Shift+X`), search for **TS One-Line Imports** and click **Install**. Cursor, VSCodium and other editors that use Open VSX find it there under the same name.

Or from a terminal:

```bash
code --install-extension su-labs.ts-one-line-imports
```

To install it offline or in an editor without either store, download the `.vsix` of any version from [GitHub Releases](https://github.com/Greezaaa/settings-utils-lib/releases?q=ts-one-line-imports&expanded=true), check it against the SHA-256 in the release notes, then use **Install from VSIX...** in the Extensions view.

## Setup

Make it the default formatter for TypeScript and JavaScript once, in your **user** settings (`Cmd+Shift+P` → **Preferences: Open User Settings (JSON)**), so it applies to every project:

```jsonc
{
  "[typescript]": { "editor.defaultFormatter": "su-labs.ts-one-line-imports" },
  "[typescriptreact]": { "editor.defaultFormatter": "su-labs.ts-one-line-imports" },
  "[javascript]": { "editor.defaultFormatter": "su-labs.ts-one-line-imports" },
  "[javascriptreact]": { "editor.defaultFormatter": "su-labs.ts-one-line-imports" },
  "editor.formatOnSave": true
}
```

A project's own `.vscode/settings.json` wins over your user settings. If a project sets `esbenp.prettier-vscode` as its default formatter, that project keeps using the Prettier extension.

## Sorting and Removing Unused Imports

Both are off by default. Turn on either or both in your user settings:

```jsonc
{
  "tsOneLineImports.sortImports": true,
  "tsOneLineImports.removeUnusedImports": true
}
```

They run every time the extension formats, before the imports are put on one line. They use VS Code's own TypeScript support, the same as its **Sort Imports**, **Remove Unused Imports** and **Organize Imports** commands, so the project's `tsconfig.json` is respected. Side-effect imports such as `import './polyfills';` are kept. Files in `.prettierignore` are left untouched.

## Teams and CI

The extension only changes what you format in VS Code. Command-line Prettier, git hooks, CI and `eslint-plugin-prettier` don't use it, so in a project that runs them, they would wrap the imports again or report them.

For those projects, add the Prettier plugin to the project too, and everyone, the extension included, formats the same way:

```bash
npm install --save-dev @su-labs/prettier-plugin-single-line-imports
```

```js
// prettier.config.js
module.exports = {
  plugins: ['@su-labs/prettier-plugin-single-line-imports'],
};
```

The extension recognizes the plugin in a project's config and doesn't load it twice.

## Troubleshooting

**Nothing happens on save.** Check that this extension is the default formatter for the language (see [Setup](#setup)), and that the project's `.vscode/settings.json` doesn't choose another one. `Shift+Alt+F` → **Format Document With...** shows which formatter is used.

**The extension doesn't run in a folder.** It's disabled in Restricted Mode, because loading a project's Prettier config runs that project's code. Trust the folder to enable it.

**See what it did.** Open the Output panel and pick **TS One-Line Imports**. Each format logs the mode used (`prettier`, `imports-only` or `ignored`), and syntax errors and missing plugins are logged there too.

**A config change isn't picked up.** Configs are re-read when a Prettier config, `.prettierignore`, `.editorconfig` or `package.json` changes in the workspace. For a config outside the workspace, run **Developer: Reload Window**.

## Limitations

- Prettier plugins in a project that replace the TypeScript or JavaScript parser, such as `prettier-plugin-organize-imports`, are overridden by this extension for those languages. Use VS Code's own organize imports instead (see above).
- Projects are formatted with the bundled Prettier 3, not the version installed in the project. A project on Prettier 2 may see small differences.
- `prettier.config.ts` configs need a Node version that can load TypeScript files.
- Only whole documents are formatted, not selections.

## License

MIT © Yevheniy Alekseyev
