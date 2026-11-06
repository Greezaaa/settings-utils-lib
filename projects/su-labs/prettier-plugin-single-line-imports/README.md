# Prettier Plugin: Single-Line Imports

`@su-labs/prettier-plugin-single-line-imports`

![npm](https://img.shields.io/npm/v/@su-labs/prettier-plugin-single-line-imports?style=for-the-badge)
![Prettier](https://img.shields.io/badge/Prettier-3-F7B93E?style=for-the-badge&logo=prettier&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)

Keeps every `import` on a single line, whatever its length. Everything else is formatted by Prettier exactly as before.

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

- [Why](#why)
- [Installation](#installation)
- [Setup](#setup)
- [VS Code](#vs-code)
- [ESLint](#eslint)
- [What It Changes](#what-it-changes)
- [Compatibility](#compatibility)
- [Troubleshooting](#troubleshooting)
- [Limitations](#limitations)
- [License](#license)

## Why

Many teams keep imports on one line so the list of dependencies stays compact and diffs stay readable. Prettier has no option for this: any import longer than `printWidth` is wrapped. Since ESLint (through `eslint-plugin-prettier`) and format-on-save both run Prettier, the imports keep getting split again, whatever other settings are used.

This plugin changes how Prettier itself prints imports, so every tool that runs Prettier produces the same single-line output. It replaces extensions such as TypeScript Hero, which are no longer maintained.

## Installation

```bash
npm install --save-dev @su-labs/prettier-plugin-single-line-imports
```

Requires Prettier 3.

## Setup

Add the plugin to your Prettier configuration:

```js
// prettier.config.js
module.exports = {
  printWidth: 100,
  plugins: ['@su-labs/prettier-plugin-single-line-imports'],
};
```

or in `.prettierrc`:

```json
{
  "plugins": ["@su-labs/prettier-plugin-single-line-imports"]
}
```

Prettier reads only one configuration file. If your `package.json` has a `"prettier"` key, that one wins over `prettier.config.js` and `.prettierrc`, so add the plugin there or remove the key.

## VS Code

With the [Prettier extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode), this workspace setup organizes imports and keeps them on one line on every save:

```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": "explicit"
  }
}
```

VS Code runs `source.organizeImports` first and the formatter afterwards, so imports added automatically or merged by TypeScript are joined into one line by Prettier at the end.

## ESLint

`eslint-plugin-prettier` uses your Prettier configuration, so `eslint --fix` keeps imports on one line too. No extra rule is needed.

If you use the core `max-len` rule (or `@stylistic/max-len`), exclude imports from it:

```js
'max-len': ['error', { code: 100, ignorePattern: '^import\\s.+\\sfrom\\s.+;$' }],
```

## What It Changes

| Code | Result |
|------|--------|
| `import { A, B } from 'x'`, `import type { … }`, `import Default, { … }`, `import * as name`, `import 'side-effect'` | Always one line |
| An import with a `//` or `/* */` comment inside | Formatted by Prettier as usual, so a `//` comment can't hide the rest of the import |
| A comment after the import (`import { a } from 'x'; // why`) | Joined; the comment stays at the end of the line |
| `// prettier-ignore` above an import | Left exactly as written |
| Re-exports (`export { … } from 'x'`), dynamic `import()`, `import x = require()` and all other code | Formatted by Prettier as usual |

Supported parsers: `typescript`, `babel-ts` and `babel`. These are Prettier's defaults for `.ts`, `.tsx`, `.mts`, `.cts`, `.js`, `.jsx`, `.mjs` and `.cjs` files, and for TypeScript code blocks in Markdown. JSON, CSS, HTML and Angular templates are not affected.

## Compatibility

The plugin depends only on Prettier, not on Angular or your TypeScript version (Prettier ships its own parser). It works in any project that uses Prettier 3, for example Angular 17, 18, 19 and newer.

| Tested with | Versions |
|-------------|----------|
| Prettier | Every minor release from 3.0.0 to 3.9.10 |
| ESLint with `eslint-plugin-prettier` | ESLint 9.15 and 9.39 (flat config), `eslint --fix` included |
| Toolchain of an Angular 19 project | Prettier 3.3.3, ESLint 9.15, typescript-eslint 8.15, TypeScript 5.6 |
| Prettier configuration files | `.prettierrc.json`, `prettier.config.js`, `prettier.config.mjs`, `prettier.config.cjs` |
| Editor | VS Code with the Prettier extension, format on save and `source.organizeImports` |

The published code is compiled to ES2020, so it runs on every Node.js version Prettier 3 supports.

## Troubleshooting

**`npm install` fails with `peer prettier@"^3.0.0"`.** Your project uses Prettier 2. Upgrade to Prettier 3 (`npm install --save-dev prettier@3`); its plugin system is different and this plugin needs it.

**Imports still break onto several lines.**
- Check that Prettier finds the configuration that lists the plugin: `npx prettier --find-config-path src/main.ts`. Remember that a `"prettier"` key in `package.json` wins over other config files.
- In VS Code, open View → Output → Prettier to see which configuration was loaded.
- An import that contains a comment is formatted by Prettier as usual. This is on purpose.

**`require()` of the plugin fails in a CommonJS config.** The package is an ES module. List it by name (`plugins: ['@su-labs/prettier-plugin-single-line-imports']`) and Prettier loads it for you, in both `.cjs` and `.mjs` configs.

## Limitations

- Other Prettier plugins that also replace the `typescript` or `babel` parser (for example import-sorting plugins) have not been tested together with this one.
- The plugin decides on line breaks only. It doesn't add, sort or merge imports; leave that to `source.organizeImports` or your import-sorting tool.

## License

MIT © 2026 [Yevheniy Alekseyev](https://github.com/Greezaaa)
