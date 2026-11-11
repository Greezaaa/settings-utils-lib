# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-11-11

### Added
- `tsOneLineImports.sortImports` setting (off by default): sorts imports when formatting
- `tsOneLineImports.removeUnusedImports` setting (off by default): removes unused imports when formatting
- Both use VS Code's built-in TypeScript support, so the project's `tsconfig.json` is respected

## [1.0.1] - 2026-11-06

### Fixed
- Icon corners are transparent instead of white

### Changed
- README explains how to install a `.vsix` from GitHub Releases

## [1.0.0] - 2026-11-06

### Added
- Formatter for TypeScript and JavaScript (`.ts`, `.tsx`, `.js`, `.jsx`, `.mts`, `.cts`, `.mjs`, `.cjs`) that keeps every `import` on a single line
- Projects with a Prettier config are formatted with that config: options, overrides, `.editorconfig`, `.prettierignore` and the project's own plugins
- Projects with Prettier installed but no config get Prettier's defaults
- Projects without Prettier, or whose Prettier plugins aren't installed, only get their imports joined; the rest of the code is left untouched
- Imports that contain comments are left as they are, so a `//` comment can never swallow code
- Syntax errors leave the file unchanged; details go to the "TS One-Line Imports" output channel
- Bundles Prettier 3 and `@su-labs/prettier-plugin-single-line-imports`, so nothing has to be installed in the projects
- Disabled in Restricted Mode, because loading a project's Prettier config runs that project's code
