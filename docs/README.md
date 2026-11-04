# @su-labs Documentation

Pick the guide for your environment. Each guide covers installation, setup and usage of every available utility.

| Environment | Guide | Package |
|-------------|-------|---------|
| Vanilla JavaScript (with or without a bundler) | [Vanilla JS guide](guides/vanilla.md) | `@su-labs/core` |
| React (Vite, Next.js, Remix, …) | [React guide](guides/react.md) | `@su-labs/core` |
| Svelte and SvelteKit | [Svelte guide](guides/svelte.md) | `@su-labs/core` |
| Angular | [Angular guide](guides/angular.md) | `@su-labs/theme`, `@su-labs/font-size`, … |
| Node.js and server-side rendering | [Node guide](guides/node.md) | `@su-labs/core` |

## Which package do I need?

- **Angular:** use the Angular packages (`@su-labs/theme`, `@su-labs/font-size`, …). They expose Angular services with signals.
- **Anything else:** use [`@su-labs/core`](../projects/su-labs/core/README.md). It has no framework dependencies and exposes each utility as a small reactive store.

## Utility availability

Utilities are being moved into `@su-labs/core` one at a time. Until a utility is in core, it is only available for Angular.

| Utility | `@su-labs/core` (any environment) | Angular package |
|---------|-----------------------------------|-----------------|
| Theme | `@su-labs/core/theme` | `@su-labs/theme` |
| Font size | Planned | `@su-labs/font-size` |
| Notifications | `@su-labs/core/notifications` | `@su-labs/notifications` |
| Scroll spy | Planned | `@su-labs/scroll-spy` |
| Visit tracker | Planned | `@su-labs/visit-tracker` |

## API reference

The full API of each utility is documented in its package README:

- [`@su-labs/core`](../projects/su-labs/core/README.md) (store, theme, notifications)
- [`@su-labs/theme`](../projects/su-labs/theme/README.md)
- [`@su-labs/font-size`](../projects/su-labs/font-size/README.md)
- [`@su-labs/notifications`](../projects/su-labs/notifications/README.md)
- [`@su-labs/scroll-spy`](../projects/su-labs/scroll-spy/README.md)
- [`@su-labs/visit-tracker`](../projects/su-labs/visit-tracker/README.md)
