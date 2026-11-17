import { PageFeature } from '../../shared/page-feature';

export const SKELETON_FEATURES = {
  theming: {
    title: 'Your own look',
    description:
      'The colour, shimmer, corner radius, angle and speed are CSS variables, so the placeholders match the cards they stand in for.',
    code: `.themed-skeleton {
  --su-skeleton-color: rgb(16 185 129 / 0.16);
  --su-skeleton-shimmer: rgb(16 185 129 / 0.32);
  --su-skeleton-radius: 999px;
  --su-skeleton-duration: 2.4s;
}`,
  },
} satisfies Record<string, PageFeature>;
