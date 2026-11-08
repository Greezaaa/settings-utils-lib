/**
 * Features the admin switches on or off for the public from the admin page, like the games. Every new feature gets a
 * switch here, off by default (`openByDefault: false`), so it can be built and tried in preview before anyone sees it.
 * Keep in sync with FEATURE_IDS in api/src/shared/catalog.ts (its tests check).
 */
export type FeatureId = 'rooms';

export interface FeatureInfo {
  readonly id: FeatureId;
  /** Open to the public until the admin switches it, and whenever the API can't be reached */
  readonly openByDefault: boolean;
}

export const FEATURES: readonly FeatureInfo[] = [{ id: 'rooms', openByDefault: false }];

export const FEATURE_IDS: readonly FeatureId[] = FEATURES.map(({ id }) => id);
