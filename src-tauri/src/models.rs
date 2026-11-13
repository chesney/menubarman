use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScreenInfo {
    pub width: f64,
    pub height: f64,
    pub visible_width: f64,
    pub visible_height: f64,
    pub safe_area_top: f64,
    pub has_notch: bool,
    pub notch_left: f64,
    pub notch_right: f64,
    pub notch_width: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RawMenuBarItem {
    pub id: u32,
    pub pid: i32,
    pub owner: String,
    pub localized_name: String,
    pub title: String,
    pub bundle_id: String,
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
    pub onscreen: bool,
    pub obstructed: bool,
    pub offscreen: bool,
    pub is_system: bool,
    pub icon_base64: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RawMenuBarState {
    pub screen: ScreenInfo,
    pub total_count: usize,
    pub items: Vec<RawMenuBarItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MenuBarItem {
    pub id: u32,
    pub pid: i32,
    pub owner: String,
    pub localized_name: String,
    pub title: String,
    pub bundle_id: String,
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
    pub onscreen: bool,
    pub obstructed: bool,
    pub offscreen: bool,
    pub is_user_hidden: bool,
    pub is_system: bool,
    pub icon_base64: String,
    pub status: ItemStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum ItemStatus {
    Visible,
    Obstructed,
    Offscreen,
    UserHidden,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MenuBarState {
    pub screen: ScreenInfo,
    pub total_count: usize,
    pub visible_count: usize,
    pub hidden_count: usize,
    pub obstructed_count: usize,
    pub items: Vec<MenuBarItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct UserConfig {
    pub hidden_bundle_ids: Vec<String>,
    pub floating_bar_position: String, // "center-notch", "right", "cursor"
    pub auto_hide_floating_bar: bool,
    pub show_all_in_floating_bar: bool,
}
