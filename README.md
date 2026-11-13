# MenuBarMan (MenuBar Manager)

> **Fast, lightweight, native macOS Menu Bar Manager & Notch Hidden Items Inspector coded in Rust & Tauri v2.**

**MenuBarMan** provides a clean, modern, and intuitive way to manage your macOS status bar items, with first-class support for **revealing and interacting with hidden menu bar items** (especially on MacBooks with camera notches or screens crowded with status items).

---

## 🎯 The Problem

On modern MacBooks (M1/M2/M3/M4 with notches) and multi-monitor setups, macOS status bar items grow from the right screen edge toward the left. When they collide with the **hardware camera notch** or long application menus (File, Edit, View...), macOS automatically suppresses, truncates, or renders them offscreen.

Users have no native way to:
1. See which menu items are currently hidden behind the notch or pushed off-screen.
2. Access, activate, or click those hidden status items.
3. Keep their menu bar clean and organized without losing access to background utilities.

## 🚀 Key Features

- **Floating Secondary Menu Bar ("MenuBarMan Bar")**:
  - Floats gracefully directly below the MacBook camera notch or status bar.
  - Displays all hidden or obstructed status bar items in a frosted glass capsule (`backdrop-filter: blur(30px)`).
  - One-click app activation and synthetic click forwarding.
  - Quick toggle via macOS menu bar tray icon, dashboard button, or shortcut.

- **MacBook Notch Geometry & Proximity Map**:
  - Live visual timeline showing screen width, exact notch boundaries (e.g. `918px – 1138px`), safe area insets, and real-time status item coordinates.
  - Real-time color-coded pins:
    - 🟢 **Visible**: On-screen status items.
    - 🟡 **Near Notch**: Items within 100px of collision danger.
    - 🔴 **Obstructed / Hidden**: Items clipped or pushed offscreen by macOS.
    - 🟣 **User Hidden**: Items manually organized into the secondary shelf.

- **Hidden Items Shelf**:
  - Spotlight cards prominently displaying every clipped item with high-resolution 64x64 app icons, PID, window ID, collision coordinates, and direct action triggers.

- **Interactive Status Items Manager**:
  - Search across all running menu bar items by name, bundle ID, or process ID.
  - Filter by All, Hidden Only, Visible Only, Third-Party Apps, or macOS System Services.
  - Actions: **Activate App**, **Simulate Menu Click**, **Reveal in Finder**, or **Toggle User-Hidden**.

- **High Performance & Native macOS Core**:
  - **Primary Language: Rust** powering low-latency querying, event dispatch, and config persistence.
  - Native Objective-C/Cocoa bridge directly querying WindowServer status window layers (`kCGWindowLayer = 25`) with zero CPU-intensive screen recording permissions required.
  - Crisp high-resolution icon extraction via `NSRunningApplication`.

---

## 🛠 Architecture

```
menubarman/
├── src-tauri/
│   ├── src/
│   │   ├── bridge.h          # C/Objective-C FFI declarations
│   │   ├── bridge.m          # Native Cocoa & CoreGraphics WindowServer integration
│   │   ├── commands.rs       # Tauri commands (get_state, activate, click, toggle)
│   │   ├── models.rs         # Strongly typed Rust data models
│   │   ├── lib.rs            # Tauri v2 builder, tray icon, floating bar manager
│   │   └── main.rs           # Entry point
│   ├── Cargo.toml            # Rust dependencies (tauri v2, serde, cc)
│   └── tauri.conf.json       # Multi-window config (main dashboard & floating bar)
├── src/
│   ├── components/
│   │   ├── Header.tsx        # Top navigation with live stats & floating bar toggle
│   │   ├── NotchVisualizer.tsx # Scale geometry visualizer of notch & status items
│   │   ├── HiddenItemsShelf.tsx# Spotlight cards for hidden & obstructed items
│   │   ├── ItemsTable.tsx    # Searchable, filterable menu items table
│   │   ├── FloatingBar.tsx   # Floating secondary capsule bar
│   │   └── SettingsModal.tsx # Position preferences & auto-hide behavior
│   ├── services/
│   │   └── menubarService.ts # Frontend bridge service
│   ├── types/
│   │   └── menubar.ts        # TypeScript interfaces
│   ├── App.tsx               # Main app router (dashboard vs floating bar mode)
│   └── index.css             # Glassmorphic Apple-inspired styling
├── package.json
└── vite.config.ts
```

---

## 💻 Development & Build

### Prerequisites
- macOS 12+ (tested on macOS 14/15/Sonoma/Sequoia on Apple Silicon)
- Node.js 20+ & npm
- Rust & Cargo (1.75+)

### Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run in development mode (hot-reloading)
npm run tauri dev

# 3. Build release .app bundle
npm run build:app
```

---

## 📄 License

Proprietary / MIT. Author: Chesney Carolissen.
