/** Line icons drawn on a 24 × 24 grid, as stroke paths */
export const SITE_ICONS = {
  home: ['M4 11l8-7 8 7v9h-5v-6h-6v6H4z'],
  packages: ['M4 8l8-4 8 4v8l-8 4-8-4z', 'M4 8l8 4 8-4', 'M12 12v8'],
  theme: ['M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18z', 'M12 3v18', 'M12 7h4.5', 'M12 11h6', 'M12 15h5.5'],
  'font-size': ['M3.5 19 8.5 5l5 14', 'M5.5 14h6', 'M15 19l3-8 3 8', 'M16 16.5h4'],
  notifications: ['M6 16v-5a6 6 0 1 1 12 0v5l1.5 2h-15z', 'M10 20.5a2 2 0 0 0 4 0'],
  dialog: ['M4 5h16v14H4z', 'M4 9h16', 'M12 15h2.5', 'M16 15h1.5'],
  table: ['M4 5h16v14H4z', 'M4 10h16', 'M4 14.5h16', 'M10 10v9'],
  skeleton: ['M4 5h16v5H4z', 'M4 14h10', 'M4 18h6'],
  'scroll-spy': ['M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z', 'M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z'],
  'visit-tracker': ['M4 19h16', 'M5 15l4.5-4.5 3.5 3.5 6-6.5', 'M15 7.5h4v4'],
  fields: ['M3 8h18v8H3z', 'M7 10.5v3', 'M10 12h7'],
  imports: ['M9 7l-5 5 5 5', 'M15 7l5 5-5 5'],
  app: ['M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z', 'M9 12h6', 'M12 9v6'],
  changelog: ['M7 3h7l4 4v14H7z', 'M14 3v4h4', 'M10 12h5', 'M10 16h5'],
  privacy: ['M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z', 'M9.5 12l2 2 3.5-4'],
  customise: ['M4 20h4L19 9l-4-4L4 16z', 'M13 7l4 4'],
  grip: ['M9 6h.01', 'M15 6h.01', 'M9 12h.01', 'M15 12h.01', 'M9 18h.01', 'M15 18h.01'],
  close: ['M6 6l12 12', 'M18 6L6 18'],
  chevron: ['M14.5 6l-6 6 6 6'],
  settings: [
    'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
    'M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  ],
} as const satisfies Record<string, readonly string[]>;

export type SiteLineIconName = keyof typeof SITE_ICONS;

/** App logos drawn in the site's own colours, so they follow its light and dark theme */
export const SITE_LOGOS = ['smartiplay', 'reminder'] as const;
export type SiteLogoName = (typeof SITE_LOGOS)[number];

export type SiteIconName = SiteLineIconName | SiteLogoName;

export const isSiteLogo = (name: SiteIconName): name is SiteLogoName => SITE_LOGOS.some((logo) => logo === name);
