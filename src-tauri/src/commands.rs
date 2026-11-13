use crate::models::{
    ItemStatus, MenuBarItem, MenuBarState, RawMenuBarState, ScreenInfo, UserConfig,
};
use std::ffi::CStr;
use std::fs;
use std::os::raw::c_char;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{AppHandle, Manager, PhysicalPosition, PhysicalSize};

extern "C" {
    fn menubar_get_status_items_json() -> *mut c_char;
    fn menubar_free_string(s: *mut c_char);
    fn menubar_activate_self();
    fn menubar_activate_app(pid: libc::pid_t) -> bool;
    fn menubar_click_item(x: f64, y: f64) -> bool;
    fn menubar_reveal_in_finder(pid: libc::pid_t) -> bool;
}

pub struct ConfigState(pub Mutex<UserConfig>);

fn config_path() -> PathBuf {
    if let Ok(home) = std::env::var("HOME") {
        PathBuf::from(home)
            .join(".config")
            .join("menubarman")
            .join("config.json")
    } else {
        PathBuf::from("config.json")
    }
}

pub fn load_config() -> UserConfig {
    let path = config_path();
    if let Ok(content) = fs::read_to_string(&path) {
        if let Ok(config) = serde_json::from_str::<UserConfig>(&content) {
            return config;
        }
    }
    UserConfig {
        hidden_bundle_ids: Vec::new(),
        floating_bar_position: "center-notch".to_string(),
        auto_hide_floating_bar: false,
        show_all_in_floating_bar: false,
    }
}

pub fn persist_config(config: &UserConfig) -> Result<(), String> {
    let path = config_path();
    if let Some(parent) = path.parent() {
        let _ = fs::create_dir_all(parent);
    }
    let data = serde_json::to_string_pretty(config).map_err(|e| e.to_string())?;
    fs::write(&path, data).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_menu_bar_state(config_state: tauri::State<ConfigState>) -> Result<MenuBarState, String> {
    let json_ptr = unsafe { menubar_get_status_items_json() };
    if json_ptr.is_null() {
        return Err("Bridge returned null".to_string());
    }

    let json_str = unsafe {
        let c_str = CStr::from_ptr(json_ptr);
        let s = c_str.to_string_lossy().into_owned();
        menubar_free_string(json_ptr);
        s
    };

    let raw: RawMenuBarState = serde_json::from_str(&json_str)
        .map_err(|e| format!("Failed to parse menu bar JSON: {} (input: {})", e, json_str))?;

    let cfg = config_state.0.lock().map_err(|e| e.to_string())?.clone();

    let mut items: Vec<MenuBarItem> = Vec::with_capacity(raw.items.len());
    let mut visible_count = 0;
    let mut hidden_count = 0;
    let mut obstructed_count = 0;

    for raw_item in raw.items {
        let key = if !raw_item.bundle_id.is_empty() {
            &raw_item.bundle_id
        } else {
            &raw_item.owner
        };

        let is_user_hidden = cfg.hidden_bundle_ids.contains(key);

        let status = if is_user_hidden {
            ItemStatus::UserHidden
        } else if raw_item.obstructed {
            ItemStatus::Obstructed
        } else if raw_item.offscreen {
            ItemStatus::Offscreen
        } else {
            ItemStatus::Visible
        };

        match status {
            ItemStatus::Visible => visible_count += 1,
            ItemStatus::Obstructed => {
                obstructed_count += 1;
                hidden_count += 1;
            }
            ItemStatus::Offscreen | ItemStatus::UserHidden => {
                hidden_count += 1;
            }
        }

        items.push(MenuBarItem {
            id: raw_item.id,
            pid: raw_item.pid,
            owner: raw_item.owner,
            localized_name: raw_item.localized_name,
            title: raw_item.title,
            bundle_id: raw_item.bundle_id,
            x: raw_item.x,
            y: raw_item.y,
            width: raw_item.width,
            height: raw_item.height,
            onscreen: raw_item.onscreen,
            obstructed: raw_item.obstructed,
            offscreen: raw_item.offscreen,
            is_user_hidden,
            is_system: raw_item.is_system,
            icon_base64: raw_item.icon_base64,
            status,
        });
    }

    Ok(MenuBarState {
        screen: raw.screen,
        total_count: items.len(),
        visible_count,
        hidden_count,
        obstructed_count,
        items,
    })
}

#[tauri::command]
pub fn activate_app(pid: i32) -> Result<bool, String> {
    let success = unsafe { menubar_activate_app(pid) };
    Ok(success)
}

#[tauri::command]
pub fn click_status_item(x: f64, y: f64) -> Result<bool, String> {
    let success = unsafe { menubar_click_item(x, y) };
    Ok(success)
}

#[tauri::command]
pub fn reveal_in_finder(pid: i32) -> Result<bool, String> {
    let success = unsafe { menubar_reveal_in_finder(pid) };
    Ok(success)
}

#[tauri::command]
pub fn toggle_item_hidden(
    target: String,
    hidden: bool,
    config_state: tauri::State<ConfigState>,
) -> Result<UserConfig, String> {
    let mut cfg = config_state.0.lock().map_err(|e| e.to_string())?;
    if hidden {
        if !cfg.hidden_bundle_ids.contains(&target) {
            cfg.hidden_bundle_ids.push(target);
        }
    } else {
        cfg.hidden_bundle_ids.retain(|id| id != &target);
    }
    persist_config(&cfg)?;
    Ok(cfg.clone())
}

#[tauri::command]
pub fn get_user_config(config_state: tauri::State<ConfigState>) -> Result<UserConfig, String> {
    let cfg = config_state.0.lock().map_err(|e| e.to_string())?.clone();
    Ok(cfg)
}

#[tauri::command]
pub fn save_user_config(
    new_config: UserConfig,
    config_state: tauri::State<ConfigState>,
) -> Result<UserConfig, String> {
    let mut cfg = config_state.0.lock().map_err(|e| e.to_string())?;
    *cfg = new_config;
    persist_config(&cfg)?;
    Ok(cfg.clone())
}

#[tauri::command]
pub fn position_and_show_floating_bar(
    app: AppHandle,
    config_state: tauri::State<ConfigState>,
) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("floatingbar") {
        let json_ptr = unsafe { menubar_get_status_items_json() };
        let mut screen_info = ScreenInfo {
            width: 2056.0,
            height: 1329.0,
            visible_width: 2056.0,
            visible_height: 1217.0,
            safe_area_top: 38.0,
            has_notch: true,
            notch_left: 918.0,
            notch_right: 1138.0,
            notch_width: 220.0,
        };

        if !json_ptr.is_null() {
            let json_str = unsafe {
                let c_str = CStr::from_ptr(json_ptr);
                let s = c_str.to_string_lossy().into_owned();
                menubar_free_string(json_ptr);
                s
            };
            if let Ok(raw) = serde_json::from_str::<RawMenuBarState>(&json_str) {
                screen_info = raw.screen;
            }
        }

        let cfg = config_state.0.lock().map_err(|e| e.to_string())?.clone();

        let bar_width = 720.0;
        let bar_height = 62.0;

        let (pos_x, pos_y) = match cfg.floating_bar_position.as_str() {
            "right" => (
                screen_info.width - bar_width - 24.0,
                screen_info.safe_area_top + 6.0,
            ),
            _ => {
                // center under notch
                if screen_info.has_notch {
                    let notch_center = screen_info.notch_left + (screen_info.notch_width / 2.0);
                    (
                        notch_center - (bar_width / 2.0),
                        screen_info.safe_area_top + 6.0,
                    )
                } else {
                    (
                        (screen_info.width - bar_width) / 2.0,
                        screen_info.safe_area_top + 6.0,
                    )
                }
            }
        };

        let _ = window.set_position(PhysicalPosition::new(pos_x as i32, pos_y as i32));
        let _ = window.set_size(PhysicalSize::new(bar_width as u32, bar_height as u32));
        let _ = window.show();
        let _ = window.set_focus();
    }
    Ok(())
}

#[tauri::command]
pub fn hide_floating_bar(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("floatingbar") {
        let _ = window.hide();
    }
    Ok(())
}

#[tauri::command]
pub fn toggle_floating_bar(
    app: AppHandle,
    config_state: tauri::State<ConfigState>,
) -> Result<bool, String> {
    if let Some(window) = app.get_webview_window("floatingbar") {
        let is_visible = window.is_visible().unwrap_or(false);
        if is_visible {
            let _ = window.hide();
            Ok(false)
        } else {
            position_and_show_floating_bar(app, config_state)?;
            Ok(true)
        }
    } else {
        Err("Floating bar window not found".to_string())
    }
}

#[tauri::command]
pub fn is_floating_bar_visible(app: AppHandle) -> Result<bool, String> {
    if let Some(window) = app.get_webview_window("floatingbar") {
        Ok(window.is_visible().unwrap_or(false))
    } else {
        Ok(false)
    }
}

#[tauri::command]
pub fn open_main_window(app: AppHandle) -> Result<(), String> {
    // 1. Activate application at macOS system level so it takes foreground focus
    unsafe {
        menubar_activate_self();
    }

    // 2. Show and focus main window, or recreate if it was closed
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    } else {
        let _ = tauri::WebviewWindowBuilder::new(
            &app,
            "main",
            tauri::WebviewUrl::App("index.html".into()),
        )
        .title("MenuBarMan")
        .inner_size(1200.0, 800.0)
        .min_inner_size(880.0, 600.0)
        .center()
        .hidden_title(true)
        .title_bar_style(tauri::TitleBarStyle::Overlay)
        .build();
    }
    Ok(())
}
