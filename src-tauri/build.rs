fn main() {
    println!("cargo:rerun-if-changed=src/bridge.m");
    println!("cargo:rerun-if-changed=src/bridge.h");

    cc::Build::new()
        .file("src/bridge.m")
        .flag("-fobjc-arc")
        .flag("-Wno-unguarded-availability-new")
        .compile("menubar_bridge");

    println!("cargo:rustc-link-lib=framework=Cocoa");
    println!("cargo:rustc-link-lib=framework=CoreGraphics");

    tauri_build::build();
}
