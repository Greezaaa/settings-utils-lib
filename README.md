[![Stand With Ukraine](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/banner-direct-single.svg)](https://stand-with-ukraine.pp.ua)

# @su-labs • Framework-Agnostic Browser Utilities

![Framework Agnostic](https://img.shields.io/badge/Framework-Agnostic-4B5563?style=for-the-badge)
![Angular Version](https://img.shields.io/badge/Angular-v22-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)
![NPM](https://img.shields.io/badge/NPM-CB3837?style=for-the-badge&logo=npm&logoColor=white)

A collection of lightweight, reactive browser utilities built with modern practices. Each library is independently versioned and published to npm.

- **Angular:** dedicated packages with injectable services and signals.
- **React, Vue, Svelte, vanilla JavaScript and Node:** the framework-agnostic [`@su-labs/core`](projects/su-labs/core/README.md) package.

**Website:** live demos of every utility and all changelogs at [su-labs.dev](https://su-labs.dev/).

## Choose Your Environment

| Environment | Package | Guide |
|-------------|---------|-------|
| Vanilla JavaScript (bundler or CDN, no build step) | `@su-labs/core` | [Vanilla JS guide](docs/guides/vanilla.md) |
| React (Vite, Next.js, Remix, …) | `@su-labs/core` | [React guide](docs/guides/react.md) |
| Svelte and SvelteKit | `@su-labs/core` | [Svelte guide](docs/guides/svelte.md) |
| Vue 3 and Nuxt | `@su-labs/core` | [Vue guide](docs/guides/vue.md) |
| Angular | `@su-labs/theme`, `@su-labs/font-size`, … | [Angular guide](docs/guides/angular.md) |
| Node.js and server-side rendering | `@su-labs/core` | [Node guide](docs/guides/node.md) |

Every utility is available in `@su-labs/core`. See [which utilities are available where](docs/README.md#utility-availability).

---

## Framework-Agnostic Core

### [@su-labs/core](https://www.npmjs.com/package/@su-labs/core)
Browser utilities with no framework dependencies, exposed as small reactive stores that work with React's `useSyncExternalStore`, Svelte's `$store` syntax and a tiny Vue composable.

[![npm](https://img.shields.io/npm/v/@su-labs/core?style=flat-square)](https://www.npmjs.com/package/@su-labs/core)
[![downloads](https://img.shields.io/npm/dt/@su-labs/core?style=flat-square)](https://www.npmjs.com/package/@su-labs/core)

```bash
npm install @su-labs/core
```

**Features:**
- Theme management (`@su-labs/core/theme`)
- Font size controls (`@su-labs/core/font-size`)
- Toast notifications (`@su-labs/core/notifications`)
- Data tables (`@su-labs/core/table`)
- Scroll spy (`@su-labs/core/scroll-spy`)
- Visit tracking (`@su-labs/core/visit-tracker`)
- Works in any framework or none
- Safe to import in Node and during server-side rendering
- Zero runtime dependencies

[Documentation](https://github.com/Greezaaa/settings-utils-lib/tree/main/projects/su-labs/core#readme)

---

## Angular Libraries

These packages are built for Angular 22+ and expose injectable services with signals.
On Angular 19 or 20, install the matching line: `npm install @su-labs/theme@ng19` (or `@ng20`).

### [@su-labs/visit-tracker](https://www.npmjs.com/package/@su-labs/visit-tracker)
Track user visits with reactive signals, milestone detection, and localStorage persistence.

[![npm](https://img.shields.io/npm/v/@su-labs/visit-tracker?style=flat-square)](https://www.npmjs.com/package/@su-labs/visit-tracker)
[![downloads](https://img.shields.io/npm/dt/@su-labs/visit-tracker?style=flat-square)](https://www.npmjs.com/package/@su-labs/visit-tracker)

```bash
npm install @su-labs/visit-tracker
```

**Features:**
- Track visit counts automatically
- Milestone detection (10th, 100th visit)
- localStorage persistence
- Reactive signals API

[Documentation](https://github.com/Greezaaa/settings-utils-lib/tree/main/projects/su-labs/visit-tracker#readme)

---

### [@su-labs/table](https://www.npmjs.com/package/@su-labs/table)
Accessible data tables mapped from your API's JSON with typed columns.

[![npm](https://img.shields.io/npm/v/@su-labs/table?style=flat-square)](https://www.npmjs.com/package/@su-labs/table)
[![downloads](https://img.shields.io/npm/dt/@su-labs/table?style=flat-square)](https://www.npmjs.com/package/@su-labs/table)

```bash
npm install @su-labs/table
```

**Features:**
- Typed columns from your API's rows
- Sorting, selection, inline and bulk editing
- Drag-and-drop and keyboard reordering
- Row and bulk actions, announced changes

[Documentation](https://github.com/Greezaaa/settings-utils-lib/tree/main/projects/su-labs/table#readme)

---

### [@su-labs/theme](https://www.npmjs.com/package/@su-labs/theme)
Comprehensive theme management with dark mode, system preferences, and CSS variables.

[![npm](https://img.shields.io/npm/v/@su-labs/theme?style=flat-square)](https://www.npmjs.com/package/@su-labs/theme)
[![downloads](https://img.shields.io/npm/dt/@su-labs/theme?style=flat-square)](https://www.npmjs.com/package/@su-labs/theme)

```bash
npm install @su-labs/theme
```

On Angular 19 or 20, add the matching tag: `npm install @su-labs/theme@ng19` or `@su-labs/theme@ng20`. Those versions
have the same features; on Angular 19 and 20.0–20.1 the notifications show and hide without their slide animation.

**Features:**
- Light, dark, contrast themes
- System preference detection
- CSS custom properties
- Persistent user preference

[Documentation](https://github.com/Greezaaa/settings-utils-lib/tree/main/projects/su-labs/theme#readme)

---

### [@su-labs/notifications](https://www.npmjs.com/package/@su-labs/notifications)
Beautiful toast notifications with multiple positions, icons, and auto-dismiss.

[![npm](https://img.shields.io/npm/v/@su-labs/notifications?style=flat-square)](https://www.npmjs.com/package/@su-labs/notifications)
[![downloads](https://img.shields.io/npm/dt/@su-labs/notifications?style=flat-square)](https://www.npmjs.com/package/@su-labs/notifications)

```bash
npm install @su-labs/notifications
```

**Features:**
- 6 position options
- Multiple notification types
- Custom icons support
- Auto-dismiss timer

[Documentation](https://github.com/Greezaaa/settings-utils-lib/tree/main/projects/su-labs/notifications#readme)

---

### [@su-labs/scroll-spy](https://www.npmjs.com/package/@su-labs/scroll-spy)
Track active sections on scroll with IntersectionObserver for smooth navigation highlighting.

[![npm](https://img.shields.io/npm/v/@su-labs/scroll-spy?style=flat-square)](https://www.npmjs.com/package/@su-labs/scroll-spy)
[![downloads](https://img.shields.io/npm/dt/@su-labs/scroll-spy?style=flat-square)](https://www.npmjs.com/package/@su-labs/scroll-spy)

```bash
npm install @su-labs/scroll-spy
```

**Features:**
- IntersectionObserver API
- Reactive signals
- Active section tracking
- Mobile-optimized

[Documentation](https://github.com/Greezaaa/settings-utils-lib/tree/main/projects/su-labs/scroll-spy#readme)

---

### [@su-labs/font-size](https://www.npmjs.com/package/@su-labs/font-size)
Accessible font size controls with WCAG compliance and user preference persistence.

[![npm](https://img.shields.io/npm/v/@su-labs/font-size?style=flat-square)](https://www.npmjs.com/package/@su-labs/font-size)
[![downloads](https://img.shields.io/npm/dt/@su-labs/font-size?style=flat-square)](https://www.npmjs.com/package/@su-labs/font-size)

```bash
npm install @su-labs/font-size
```

**Features:**
- WCAG 2.1 AA compliant
- CSS variables integration
- Persistent preferences
- Multiple size presets

[Documentation](https://github.com/Greezaaa/settings-utils-lib/tree/main/projects/su-labs/font-size#readme)

---

## Why @su-labs?

### Built for Modern Angular
- **Angular 22+** - Latest features and optimizations
- **Signals** - Reactive, performant state management
- **Standalone** - No NgModules required
- **TypeScript** - Full type safety

### Developer Experience
- **Zero Dependencies** - Lightweight bundles
- **Well Tested** - Comprehensive test coverage
- **Great Docs** - Clear examples and API references
- **Easy to Use** - Simple, intuitive APIs

### Production Ready
- **Battle Tested** - Used in real-world applications
- **Type Safe** - Full TypeScript support
- **Performant** - Optimized for speed
- **Cross-Browser** - Works everywhere

---

## Quick Start

### 1. Install a library

```bash
npm install @su-labs/theme
```

### 2. Initialize in your app

```typescript
// app.config.ts
import { provideAppInitializer, inject } from '@angular/core';
import { SuThemeService } from '@su-labs/theme';

export const appConfig = {
  providers: [
    provideAppInitializer(() => {
      inject(SuThemeService).init();
    }),
  ],
};
```

### 3. Use in components

```typescript
import { Component, inject } from '@angular/core';
import { SuThemeService } from '@su-labs/theme';

@Component({
  template: `<button (click)="themeService.setTheme('dark')">Dark Mode</button>`
})
export class AppComponent {
  themeService = inject(SuThemeService);
}
```

---

## Documentation

Start with the [guide for your environment](docs/README.md). Each library also has comprehensive documentation including:

- **Quick Start** - Get up and running in minutes
- **API Reference** - Complete method and type documentation
- **Examples** - Real-world usage examples
- **Troubleshooting** - Common issues and solutions
- **Accessibility** - WCAG compliance guidelines

Visit individual library READMEs for detailed documentation.

---

## Development

This is a monorepo workspace managed with Angular CLI.

### Project Structure

```
settings-utils-lib/
├── projects/
│   └── su-labs/
│       ├── core/           # Framework-agnostic utilities
│       ├── visit-tracker/
│       ├── theme/
│       ├── notifications/
│       ├── scroll-spy/
│       ├── table/
│       └── font-size/
├── web/                # Website with live demos (su-labs.dev)
├── dist/               # Build output
├── package.json        # Root dependencies
└── angular.json        # Workspace configuration
```

### Build All Libraries

```bash
npm run build:all
```

### Build Individual Library

```bash
npm run build:core
npm run build:visit-tracker
npm run build:theme
npm run build:notifications
npm run build:scroll-spy
npm run build:table
npm run build:font-size
```

### Run the Website

```bash
npm run start:web
```

The site in `web/` compiles the libraries from source, so it always shows the current code. It is hosted at [su-labs.dev](https://su-labs.dev/). To publish changes:

```bash
npm run deploy:web
```

This builds the site and uploads `dist/web/browser` with `rsync` to the server's `su-labs-site` nginx folder. It needs an SSH host named `su-labs-server` in `~/.ssh/config` (server address, user and key); the address and key are kept out of the repository. Changelogs are read live from GitHub, so a release only needs its `CHANGELOG.md` pushed.

The games moved to their own repository, Smartiplay ([smartiplay.com](https://smartiplay.com/)), which uses the `@su-labs/*` packages from npm.

On the server, the site is an `nginx:alpine` Docker container (`su-labs-site` on port 3000) that mounts its folder as `/usr/share/nginx/html` and its config from [`deploy/nginx/`](deploy/nginx/) as `/etc/nginx/conf.d/default.conf`. A Cloudflare Tunnel forwards each hostname to its port and handles HTTPS.

Each build writes a `404.html`: the site's own "page not found" page, with its header and footer. The part of the nginx config that serves it, so missing pages show it with a real 404 status, is:

```nginx
error_page 404 /404.html;

location / {
  try_files $uri $uri/ =404;
}
```

### Run Tests

```bash
npm test
```

---

## Contributing

Contributions are welcome! Here's how you can help:

### Reporting Issues

Found a bug or have a feature request?

1. Check existing [issues](https://github.com/Greezaaa/settings-utils-lib/issues)
2. Create a new issue with a clear description
3. Include code examples and reproduction steps

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write/update tests
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Standards

- Write TypeScript with strict mode
- Follow Angular style guide
- Include unit tests
- Update documentation
- Use conventional commits

---

## Publishing

Each library is independently versioned and published to npm.

### Version Strategy

All libraries follow Angular's versioning:
- **Major version** matches Angular major version (e.g., v22.x.x for Angular 22)
- **Minor version** for new features
- **Patch version** for bug fixes

### Publishing Process

```bash
# 1. Update version in package.json
cd projects/su-labs/library-name

# 2. Update CHANGELOG.md

# 3. Build from root
cd ../../..
npm run build:library-name

# 4. Publish
cd dist/su-labs/library-name
npm publish --access public
```

### Angular 19 and 20 builds

The same source is also built for Angular 19 and 20, with that Angular's own compiler (toolchains in
`compat/angular-19` and `compat/angular-20`). Versions are `19.<minor>.<patch>` and `20.<minor>.<patch>` of the current
release, published under a dist-tag so `latest` stays on Angular 22.

```bash
# once: install the toolchains
(cd compat/angular-19 && npm ci)
(cd compat/angular-20 && npm ci)

# build every Angular package, plus a small app using all of them to prove they link and run
npm run build:ng19
npm run build:ng20

# publish one package
(cd dist/su-labs-ng19/library-name && npm publish --access public --tag ng19)
(cd dist/su-labs-ng20/library-name && npm publish --access public --tag ng20)
```

Without `--tag`, npm would make the older line `latest`. Source changes that need Angular 22 have to be patched in
`scripts/build-compat.mjs` (today: `ChangeDetectionStrategy.Eager` becomes `Default`) or written to work on all three.

---

## Browser Compatibility

All libraries support modern browsers:

| Browser | Version |
|---------|---------|
| Chrome | ≥ 90 |
| Firefox | ≥ 88 |
| Safari | ≥ 14 |
| Edge | ≥ 90 |

---

## License

MIT License © 2025 [Yevheniy Alekseyev](https://github.com/Greezaaa)

See [LICENSE](https://github.com/Greezaaa/settings-utils-lib/blob/main/LICENSE) file for details.

---

## Author

**Yevheniy Alekseyev**

- Email: [yev.alekseyev@gmail.com](mailto:yev.alekseyev@gmail.com)
- GitHub: [@Greezaaa](https://github.com/Greezaaa)
- NPM: [@su-labs](https://www.npmjs.com/~su-labs)

---

## Support

- **Bug Reports**: [GitHub Issues](https://github.com/Greezaaa/settings-utils-lib/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/Greezaaa/settings-utils-lib/discussions)
- **Show Support**: [Star on GitHub](https://github.com/Greezaaa/settings-utils-lib)
- **Contact**: [yev.alekseyev@gmail.com](mailto:yev.alekseyev@gmail.com)

---

## Acknowledgments

Thanks to:
- The Angular team for the amazing framework
- The open-source community for inspiration
- All contributors and users of these libraries

---

<div align="center">

**Built with ❤️ using Angular**

[Back to Top](#su-labs--angular-utility-libraries)

</div>
