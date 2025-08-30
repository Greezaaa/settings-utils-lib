# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-08-30

### Fixed
- Ensured `"license": "MIT"` is correctly reflected in the published package metadata.

##	[1.0.0] - 2024-08-26

###	Added

- Initial public release of the @su-labs/scroll-spy library.

- Introduction of ScrollSpyService, a reactive service that uses an Angular Signal to track the currently visible section.

- Introduction of ScrollSpyDirective, a standalone directive that uses the browser's native IntersectionObserver to automatically update the ScrollSpyService when a section enters the viewport.

- Configurable rootMargin to allow precise control over when the scroll-spy effect is triggered.

- Full support for modern Angular applications using @for, @if, and inject().
