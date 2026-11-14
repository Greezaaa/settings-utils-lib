export type InstallPlatform = 'computer' | 'android' | 'apple-touch';

export type InstallGuideId = 'computer-chrome' | 'computer-safari' | 'android-chrome' | 'apple-touch-safari';

export type InstallPicture =
  | 'open-site'
  | 'address-bar'
  | 'mac-menu-bar'
  | 'browser-menu'
  | 'share'
  | 'add-to-home'
  | 'confirm'
  | 'dock'
  | 'home-screen';

export interface InstallGuide {
  readonly id: InstallGuideId;
  readonly platform: InstallPlatform;
  readonly pictures: readonly InstallPicture[];
}

export const INSTALL_PLATFORMS: readonly InstallPlatform[] = ['computer', 'android', 'apple-touch'];

export const INSTALL_GUIDES: readonly InstallGuide[] = [
  { id: 'computer-chrome', platform: 'computer', pictures: ['open-site', 'address-bar', 'confirm', 'dock'] },
  { id: 'computer-safari', platform: 'computer', pictures: ['open-site', 'mac-menu-bar', 'confirm', 'dock'] },
  { id: 'android-chrome', platform: 'android', pictures: ['open-site', 'browser-menu', 'add-to-home', 'home-screen'] },
  { id: 'apple-touch-safari', platform: 'apple-touch', pictures: ['open-site', 'share', 'add-to-home', 'home-screen'] },
];

export function guidesFor(platform: InstallPlatform): readonly InstallGuide[] {
  return INSTALL_GUIDES.filter(guide => guide.platform === platform);
}
