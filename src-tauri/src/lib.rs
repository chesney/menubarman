pub mod commands;
pub mod models;

use std::sync::Mutex;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};
use crate::commands::ConfigState;

pub fn run() {
    let initial_config = commands::load_config();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(ConfigState(Mutex::new(initial_config)))
        .setup(|app| {
            // Build Tray Icon
            let toggle_bar_i = MenuItem::with_id(app, "toggle_bar", "Toggle Floating Bar", true, None::<&str>)?;
            let open_dash_i = MenuItem::with_id(app, "open_dash", "Open MenuBarMan Dashboard", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "Quit MenuBarMan", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&toggle_bar_i, &open_dash_i, &quit_i])?;

            if let Some(icon) = app.default_window_icon() {
                let _tray = TrayIconBuilder::new()
                    .icon(icon.clone())
                    .menu(&menu)
                    .show_menu_on_left_click(false)
                    .tooltip("MenuBarMan - Menu Bar & Notch Hidden Items Inspector")
                    .on_menu_event(|app, event| {
                        match event.id.as_ref() {
                            "toggle_bar" => {
                                let config_state = app.state::<ConfigState>();
                                let _ = commands::toggle_floating_bar(app.clone(), config_state);
                            }
                            "open_dash" => {
                                let _ = commands::open_main_window(app.clone());
                            }
                            "quit" => {
                                app.exit(0);
                            }
                            _ => {}
                        }
                    })
                    .on_tray_icon_event(|tray, event| {
                        if let TrayIconEvent::Click {
                            button: MouseButton::Left,
                            button_state: MouseButtonState::Up,
                            ..
                        } = event
                        {
                            let app = tray.app_handle();
                            let config_state = app.state::<ConfigState>();
                            let _ = commands::toggle_floating_bar(app.clone(), config_state);
                        }
                    })
                    .build(app)?;
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_menu_bar_state,
            commands::activate_app,
            commands::click_status_item,
            commands::reveal_in_finder,
            commands::toggle_item_hidden,
            commands::get_user_config,
            commands::save_user_config,
            commands::position_and_show_floating_bar,
            commands::hide_floating_bar,
            commands::toggle_floating_bar,
            commands::is_floating_bar_visible,
            commands::open_main_window,
        ])
        .run(tauri::generate_context!())
        .expect("error while running menubarman application");
}
