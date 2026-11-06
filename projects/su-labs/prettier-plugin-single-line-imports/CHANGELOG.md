# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Prettier plugin that prints every `import` declaration on a single line, regardless of `printWidth`
- Supports the `typescript`, `babel-ts` and `babel` parsers
- Imports that contain comments are formatted by Prettier as usual, so a `//` comment can never swallow code
- `// prettier-ignore` above an import is respected
- Works with every Prettier 3 release (tested from 3.0.0 to 3.9.10) and with `eslint-plugin-prettier`
- Published as an ES2020 ES module with TypeScript declarations and no runtime dependencies
