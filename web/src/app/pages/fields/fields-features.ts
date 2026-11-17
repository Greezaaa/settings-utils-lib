import { PageFeature } from '../../shared/page-feature';

export const FIELDS_FEATURES = {
  theming: {
    title: 'Your own look',
    description:
      'Every colour and size is a CSS variable: the accent, borders, the switch track and knob, the checkbox and its tick, the chips and the strength meter.',
    code: `.themed-fields {
  --su-field-accent: #10b981;
  --su-switch-track-on: #10b981;
  --su-switch-on: #10b981;
  --su-switch-width: 3.25rem;
  --su-switch-height: 1.75rem;
  --su-checkbox-size: 1.375rem;
  --su-checkbox-tick: #0f3d2e;
}`,
  },
} satisfies Record<string, PageFeature>;
