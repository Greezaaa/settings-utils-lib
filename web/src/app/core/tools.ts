import { PageMeta } from './page-meta';
import { SiteLineIconName } from './site-icons';

export interface SiteTool {
  readonly slug: string;
  readonly name: string;
  readonly icon: SiteLineIconName;
  readonly summary: string;
  readonly description: string;
}

export const SITE_TOOLS: readonly SiteTool[] = [
  {
    slug: 'one-line-imports',
    name: 'One-line imports',
    icon: 'imports',
    summary: 'Keep every TypeScript and JavaScript import on one line.',
    description:
      'Keep every TypeScript and JavaScript import on one line: a VS Code extension for every project you open, and a Prettier plugin for your team and CI.',
  },
  {
    slug: 'cubic-bezier',
    name: 'Cubic bezier',
    icon: 'bezier',
    summary: 'Shape a CSS easing curve and play it.',
    description:
      'A free cubic-bezier editor: drag the control points, play the curve against linear or a CSS keyword, and copy the CSS easing.',
  },
  {
    slug: 'spring-easing',
    name: 'Spring easing',
    icon: 'spring',
    summary: 'Turn a spring into a CSS linear() easing.',
    description:
      'A free spring easing generator: set stiffness, damping and mass, watch the bounce, and copy it as a CSS linear() easing.',
  },
  {
    slug: 'gradient',
    name: 'Gradient',
    icon: 'gradient',
    summary: 'Build linear, radial and conic CSS gradients.',
    description:
      'A free CSS gradient builder: linear, radial and conic gradients with draggable colour stops, smooth oklch blending and copy-ready CSS.',
  },
  {
    slug: 'box-shadow',
    name: 'Box shadow',
    icon: 'shadow',
    summary: 'Layer soft, sharp and inset shadows.',
    description: 'A free CSS box-shadow builder: stack shadow layers, start from presets and copy the CSS.',
  },
  {
    slug: 'clip-path',
    name: 'Clip path',
    icon: 'clip-path',
    summary: 'Drag the points of a CSS polygon shape.',
    description:
      'A free CSS clip-path editor: drag the points of a polygon, start from common shapes and copy the clip-path.',
  },
  {
    slug: 'contrast',
    name: 'Contrast checker',
    icon: 'contrast',
    summary: 'Check text and background colours against WCAG.',
    description:
      'A free WCAG contrast checker: see the contrast ratio of two colours, which levels they pass, and the nearest colour that passes.',
  },
  {
    slug: 'colors',
    name: 'Colour converter',
    icon: 'palette',
    summary: 'Convert colours and build a palette of shades.',
    description:
      'A free colour converter: hex, rgb, hsl and oklch in one place, plus a palette of shades from 50 to 950 as CSS variables.',
  },
  {
    slug: 'fluid-type',
    name: 'Fluid type',
    icon: 'fluid-type',
    summary: 'Make clamp() sizes and fluid type scales.',
    description:
      'A free fluid type calculator: get a CSS clamp() size between two viewport widths, or a whole fluid type scale as CSS variables.',
  },
];

export const getTool = (slug: string): SiteTool => {
  const tool = SITE_TOOLS.find((item) => item.slug === slug);
  if (!tool) {
    throw new Error(`Unknown tool: ${slug}`);
  }
  return tool;
};

export const toolMeta = (slug: string): PageMeta => ({ description: getTool(slug).description });
