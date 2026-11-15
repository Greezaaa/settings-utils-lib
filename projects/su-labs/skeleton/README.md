# Skeleton

`@su-labs/skeleton`

![Angular Version](https://img.shields.io/badge/Angular-v22-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)

Skeleton loaders for Angular that you draw with your own HTML and CSS, so they keep the real layout, grids and breakpoints:

- **Your own shapes**: any element inside the skeleton becomes a grey placeholder. Size and place it like the real content.
- **One shimmer**: a single tilted shine sweeps across every shape at once, instead of each shape shining on its own.
- **Screen readers**: the region is marked busy while loading, and the content is read out politely once it's there.
- **Light**: plain CSS with no JavaScript running while it shimmers. The shimmer stops for visitors who ask their device for less motion.

## Installation

```bash
npm install @su-labs/skeleton
```

## Usage

```ts
import { SuSkeletonBusyDirective, SuSkeletonComponent } from '@su-labs/skeleton';

@Component({
  imports: [SuSkeletonBusyDirective, SuSkeletonComponent],
})
```

```html
<section class="profile" [suSkeletonBusy]="loading()">
  @if (loading()) {
    <su-lib-skeleton>
      <div class="avatar"></div>
      <div class="lines su-skeleton-layout">
        <div></div>
        <div></div>
        <div></div>
      </div>
    </su-lib-skeleton>
  } @else {
    <img class="avatar" [src]="user().photo" alt="" />
    <div class="lines">...</div>
  }
</section>
```

```css
.profile {
  display: grid;
  gap: 1rem;
  grid-template-columns: 4rem 1fr;
}

.avatar {
  aspect-ratio: 1;
  border-radius: 50%;
}

.lines {
  display: grid;
  gap: 0.75rem;
}

.lines > * {
  min-height: 1rem;
}

.lines > :last-child {
  width: 80%;
}
```

`su-lib-skeleton` takes no room of its own (`display: contents`), so its shapes sit in the parent's grid or flex layout like the real content does.

| | |
|---|---|
| `su-lib-skeleton` | Draws every element inside it as a placeholder, hidden from screen readers |
| `su-skeleton-layout` class | A wrapper that only lays shapes out: it isn't drawn, its children are |
| `[suSkeletonBusy]="loading"` | On the region that holds the skeleton and later the content: sets `aria-busy` while loading and `aria-live="polite"` |

## Theming

| Variable | Default | |
|---|---|---|
| `--su-skeleton-color` | `#e8e8e8` | The shapes |
| `--su-skeleton-shimmer` | `#ffffff` | The shine that sweeps across |
| `--su-skeleton-radius` | `0.375rem` | Corner radius of every shape; a shape's own `border-radius` wins |
| `--su-skeleton-duration` | `2s` | One sweep |
| `--su-skeleton-angle` | `100deg` | Tilt of the shine |

Set the colours for a dark theme, for example:

```css
[data-theme='dark'] {
  --su-skeleton-color: #2a2d33;
  --su-skeleton-shimmer: #3a3e46;
}
```

The shine is fixed to the window so it runs across every shape together. iOS Safari doesn't support that, so there each shape shines on its own.

## Without Angular

The same stylesheet and a small helper are in [`@su-labs/core`](https://www.npmjs.com/package/@su-labs/core): import `@su-labs/core/skeleton.css`, give the wrapper the `su-skeleton` class and `aria-hidden="true"`, and mark the region with `setSuSkeletonBusy(region, busy)` from `@su-labs/core/skeleton`.

## License

MIT
