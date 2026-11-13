import { invoke } from '@tauri-apps/api/core';
import { MenuBarState, UserConfig } from '../types/menubar';

export const menubarService = {
  async getMenuBarState(): Promise<MenuBarState> {
    return await invoke<MenuBarState>('get_menu_bar_state');
  },

  async activateApp(pid: number): Promise<boolean> {
    return await invoke<boolean>('activate_app', { pid });
  },

  async clickStatusItem(x: number, y: number): Promise<boolean> {
    return await invoke<boolean>('click_status_item', { x, y });
  },

  async revealInFinder(pid: number): Promise<boolean> {
    return await invoke<boolean>('reveal_in_finder', { pid });
  },

  async toggleItemHidden(target: string, hidden: boolean): Promise<UserConfig> {
    return await invoke<UserConfig>('toggle_item_hidden', { target, hidden });
  },

  async getUserConfig(): Promise<UserConfig> {
    return await invoke<UserConfig>('get_user_config');
  },

  async saveUserConfig(newConfig: UserConfig): Promise<UserConfig> {
    return await invoke<UserConfig>('save_user_config', { newConfig });
  },

  async positionAndShowFloatingBar(): Promise<void> {
    await invoke('position_and_show_floating_bar');
  },

  async hideFloatingBar(): Promise<void> {
    await invoke('hide_floating_bar');
  },

  async toggleFloatingBar(): Promise<boolean> {
    return await invoke<boolean>('toggle_floating_bar');
  },

  async isFloatingBarVisible(): Promise<boolean> {
    return await invoke<boolean>('is_floating_bar_visible');
  },

  async openMainWindow(): Promise<void> {
    await invoke('open_main_window');
  },
};
