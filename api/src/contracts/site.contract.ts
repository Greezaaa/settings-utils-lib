export interface GameSwitch {
  readonly game: string;
  readonly enabled: boolean;
}

export interface GameCategoryList {
  readonly game: string;
  readonly categories: readonly string[];
}

export interface ThumbnailVersion {
  readonly game: string;
  readonly version: number;
}

export interface FeatureSwitch {
  readonly feature: string;
  readonly enabled: boolean;
}

export interface SiteView {
  readonly games: readonly GameSwitch[];
  readonly categories: readonly GameCategoryList[];
  readonly thumbnails: readonly ThumbnailVersion[];
  readonly features: readonly FeatureSwitch[];
  readonly newsVersion: string;
}
