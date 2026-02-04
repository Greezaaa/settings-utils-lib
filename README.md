# @su-labs • Angular Utility Libraries

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Angular Version](https://img.shields.io/badge/Angular-v21-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)
![NPM](https://img.shields.io/badge/NPM-CB3837?style=for-the-badge&logo=npm&logoColor=white)

A collection of lightweight, reactive Angular utilities built with modern practices. Each library is independently versioned and published to npm for easy integration into your Angular projects.

## 📚 Available Libraries

### 👀 [@su-labs/visit-tracker](https://www.npmjs.com/package/@su-labs/visit-tracker)
Track user visits with reactive signals, milestone detection, and localStorage persistence.

[![npm](https://img.shields.io/npm/v/@su-labs/visit-tracker?style=flat-square)](https://www.npmjs.com/package/@su-labs/visit-tracker)
[![downloads](https://img.shields.io/npm/dt/@su-labs/visit-tracker?style=flat-square)](https://www.npmjs.com/package/@su-labs/visit-tracker)

```bash
npm install @su-labs/visit-tracker
```

**Features:**
- 📊 Track visit counts automatically
- 🎯 Milestone detection (10th, 100th visit)
- 💾 localStorage persistence
- ⚡ Reactive signals API

[📖 Documentation](https://github.com/Greezaaa/settings-utils-lib/tree/main/projects/su-labs/visit-tracker#readme)

---

### 🎨 [@su-labs/theme](https://www.npmjs.com/package/@su-labs/theme)
Comprehensive theme management with dark mode, system preferences, and CSS variables.

[![npm](https://img.shields.io/npm/v/@su-labs/theme?style=flat-square)](https://www.npmjs.com/package/@su-labs/theme)
[![downloads](https://img.shields.io/npm/dt/@su-labs/theme?style=flat-square)](https://www.npmjs.com/package/@su-labs/theme)

```bash
npm install @su-labs/theme
```

**Features:**
- 🌓 Light, dark, contrast themes
- 🖥️ System preference detection
- 🎨 CSS custom properties
- 💾 Persistent user preference

[📖 Documentation](https://github.com/Greezaaa/settings-utils-lib/tree/main/projects/su-labs/theme#readme)

---

### 🔔 [@su-labs/notifications](https://www.npmjs.com/package/@su-labs/notifications)
Beautiful toast notifications with multiple positions, icons, and auto-dismiss.

[![npm](https://img.shields.io/npm/v/@su-labs/notifications?style=flat-square)](https://www.npmjs.com/package/@su-labs/notifications)
[![downloads](https://img.shields.io/npm/dt/@su-labs/notifications?style=flat-square)](https://www.npmjs.com/package/@su-labs/notifications)

```bash
npm install @su-labs/notifications
```

**Features:**
- 🎯 6 position options
- 🎨 Multiple notification types
- 🖼️ Custom icons support
- ⏱️ Auto-dismiss timer

[📖 Documentation](https://github.com/Greezaaa/settings-utils-lib/tree/main/projects/su-labs/notifications#readme)

---

### 🔍 [@su-labs/scroll-spy](https://www.npmjs.com/package/@su-labs/scroll-spy)
Track active sections on scroll with IntersectionObserver for smooth navigation highlighting.

[![npm](https://img.shields.io/npm/v/@su-labs/scroll-spy?style=flat-square)](https://www.npmjs.com/package/@su-labs/scroll-spy)
[![downloads](https://img.shields.io/npm/dt/@su-labs/scroll-spy?style=flat-square)](https://www.npmjs.com/package/@su-labs/scroll-spy)

```bash
npm install @su-labs/scroll-spy
```

**Features:**
- 🚀 IntersectionObserver API
- ⚡ Reactive signals
- 🎯 Active section tracking
- 📱 Mobile-optimized

[📖 Documentation](https://github.com/Greezaaa/settings-utils-lib/tree/main/projects/su-labs/scroll-spy#readme)

---

### 📏 [@su-labs/font-size](https://www.npmjs.com/package/@su-labs/font-size)
Accessible font size controls with WCAG compliance and user preference persistence.

[![npm](https://img.shields.io/npm/v/@su-labs/font-size?style=flat-square)](https://www.npmjs.com/package/@su-labs/font-size)
[![downloads](https://img.shields.io/npm/dt/@su-labs/font-size?style=flat-square)](https://www.npmjs.com/package/@su-labs/font-size)

```bash
npm install @su-labs/font-size
```

**Features:**
- ♿ WCAG 2.1 AA compliant
- 🎨 CSS variables integration
- 💾 Persistent preferences
- 📏 Multiple size presets

[📖 Documentation](https://github.com/Greezaaa/settings-utils-lib/tree/main/projects/su-labs/font-size#readme)

---

## 💡 Why @su-labs?

### Built for Modern Angular
- ✅ **Angular 21+** - Latest features and optimizations
- ✅ **Signals** - Reactive, performant state management
- ✅ **Standalone** - No NgModules required
- ✅ **TypeScript** - Full type safety

### Developer Experience
- 📦 **Zero Dependencies** - Lightweight bundles
- 🧪 **Well Tested** - Comprehensive test coverage
- 📝 **Great Docs** - Clear examples and API references
- 🔧 **Easy to Use** - Simple, intuitive APIs

### Production Ready
- 🎯 **Battle Tested** - Used in real-world applications
- 🔒 **Type Safe** - Full TypeScript support
- ⚡ **Performant** - Optimized for speed
- 🌐 **Cross-Browser** - Works everywhere

---

## 🚀 Quick Start

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

## 📖 Documentation

Each library has comprehensive documentation including:

- 🎯 **Quick Start** - Get up and running in minutes
- 📚 **API Reference** - Complete method and type documentation
- 💡 **Examples** - Real-world usage examples
- 🔧 **Troubleshooting** - Common issues and solutions
- ♿ **Accessibility** - WCAG compliance guidelines

Visit individual library READMEs for detailed documentation.

---

## 🛠️ Development

This is a monorepo workspace managed with Angular CLI.

### Project Structure

```
settings-utils-lib/
├── projects/
│   └── su-labs/
│       ├── visit-tracker/
│       ├── theme/
│       ├── notifications/
│       ├── scroll-spy/
│       └── font-size/
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
npm run build:visit-tracker
npm run build:theme
npm run build:notifications
npm run build:scroll-spy
npm run build:font-size
```

### Run Tests

```bash
npm test
```

---

## 🤝 Contributing

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

- ✅ Write TypeScript with strict mode
- ✅ Follow Angular style guide
- ✅ Include unit tests
- ✅ Update documentation
- ✅ Use conventional commits

---

## 📦 Publishing

Each library is independently versioned and published to npm.

### Version Strategy

All libraries follow Angular's versioning:
- **Major version** matches Angular major version (e.g., v21.x.x for Angular 21)
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

---

## 🌐 Browser Compatibility

All libraries support modern browsers:

| Browser | Version |
|---------|---------|
| Chrome | ≥ 90 |
| Firefox | ≥ 88 |
| Safari | ≥ 14 |
| Edge | ≥ 90 |

---

## 📄 License

MIT License © 2025 [Yevheniy Alekseyev](https://github.com/Greezaaa)

See [LICENSE](https://github.com/Greezaaa/settings-utils-lib/blob/main/LICENSE) file for details.

---

## 👤 Author

**Yevheniy Alekseyev**

- 📧 Email: [yev.alekseyev@gmail.com](mailto:yev.alekseyev@gmail.com)
- 🐙 GitHub: [@Greezaaa](https://github.com/Greezaaa)
- 📦 NPM: [@su-labs](https://www.npmjs.com/~su-labs)

---

## 💬 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/Greezaaa/settings-utils-lib/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/Greezaaa/settings-utils-lib/discussions)
- ⭐ **Show Support**: [Star on GitHub](https://github.com/Greezaaa/settings-utils-lib)
- 📧 **Contact**: [yev.alekseyev@gmail.com](mailto:yev.alekseyev@gmail.com)

---

## 🙏 Acknowledgments

Thanks to:
- The Angular team for the amazing framework
- The open-source community for inspiration
- All contributors and users of these libraries

---

<div align="center">

**Built with ❤️ using Angular**

[⬆ Back to Top](#su-labs--angular-utility-libraries)

</div>