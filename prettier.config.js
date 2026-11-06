// prettier.config.js
// This is the only Prettier configuration: a "prettier" key in package.json would take precedence over it.
module.exports = {
  tabWidth: 2,
  useTabs: false,
  singleQuote: true,
  semi: true,
  bracketSpacing: true,
  arrowParens: 'avoid',
  trailingComma: 'es5',
  bracketSameLine: true,
  printWidth: 80,
  // Keeps every import on one line, whatever printWidth says.
  // Loaded from source while it's being tried out here; switch to the npm package name once it's published.
  plugins: ['./projects/su-labs/prettier-plugin-single-line-imports/src/index.ts'],
  overrides: [
    {
      files: '*.html',
      options: {
        parser: 'angular',
      },
    },
  ],
};
