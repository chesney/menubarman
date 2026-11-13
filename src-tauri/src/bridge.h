#ifndef MENUBAR_BRIDGE_H
#define MENUBAR_BRIDGE_H

#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <sys/types.h>

#ifdef __cplusplus
extern "C" {
#endif

/// Returns a JSON string containing screen geometry, notch bounds, and all detected menu bar items.
/// Caller must free the returned pointer using menubar_free_string().
char *menubar_get_status_items_json(void);

/// Frees a string allocated by Objective-C bridge.
void menubar_free_string(char *s);

/// Activates the application owning the given PID and brings its windows to the front.
bool menubar_activate_app(pid_t pid);

/// Synthesizes a mouse click at coordinates (x, y) in screen coordinates.
bool menubar_click_item(double x, double y);

/// Reveals the application bundle for the given PID in Finder.
bool menubar_reveal_in_finder(pid_t pid);

#ifdef __cplusplus
}
#endif

#endif // MENUBAR_BRIDGE_H
