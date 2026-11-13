export interface ScreenInfo {
  width: number;
  height: number;
  visibleWidth: number;
  visibleHeight: number;
  safeAreaTop: number;
  hasNotch: boolean;
  notchLeft: number;
  notchRight: number;
  notchWidth: number;
}

export type ItemStatus = 'visible' | 'obstructed' | 'offscreen' | 'userhidden';

export interface MenuBarItem {
  id: number;
  pid: number;
  owner: string;
  localizedName: string;
  title: string;
  bundleId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  onscreen: boolean;
  obstructed: boolean;
  offscreen: boolean;
  isUserHidden: boolean;
  isSystem: boolean;
  iconBase64: string;
  status: ItemStatus;
}

export interface MenuBarState {
  screen: ScreenInfo;
  totalCount: number;
  visibleCount: number;
  hiddenCount: number;
  obstructedCount: number;
  items: MenuBarItem[];
}

export interface UserConfig {
  hiddenBundleIds: string[];
  floatingBarPosition: string; // 'center-notch' | 'right' | 'cursor'
  autoHideFloatingBar: boolean;
  showAllInFloatingBar: boolean;
}
