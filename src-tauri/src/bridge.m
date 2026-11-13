#import "bridge.h"
#import <Cocoa/Cocoa.h>
#import <CoreGraphics/CoreGraphics.h>

char *menubar_get_status_items_json(void) {
    @autoreleasepool {
        CFArrayRef windowList = CGWindowListCopyWindowInfo(kCGWindowListOptionAll, kCGNullWindowID);
        if (!windowList) {
            return strdup("{\"error\":\"Failed to copy window info\"}");
        }

        NSArray *windows = (__bridge_transfer NSArray *)windowList;
        NSMutableArray *items = [NSMutableArray array];

        NSScreen *mainScreen = [NSScreen mainScreen];
        NSRect screenFrame = mainScreen ? mainScreen.frame : NSZeroRect;
        NSRect visibleFrame = mainScreen ? mainScreen.visibleFrame : NSZeroRect;
        CGFloat safeAreaTop = 24.0;
        BOOL hasNotch = NO;
        double notchLeft = 0.0;
        double notchRight = 0.0;
        double notchWidth = 0.0;

        if (mainScreen) {
            if ([mainScreen respondsToSelector:@selector(safeAreaInsets)]) {
                NSEdgeInsets insets = mainScreen.safeAreaInsets;
                if (insets.top > 0) {
                    safeAreaTop = insets.top;
                }
            }
            if ([mainScreen respondsToSelector:@selector(auxiliaryTopLeftArea)] &&
                [mainScreen respondsToSelector:@selector(auxiliaryTopRightArea)]) {
                NSRect leftAux = mainScreen.auxiliaryTopLeftArea;
                NSRect rightAux = mainScreen.auxiliaryTopRightArea;
                if (leftAux.size.width > 0 && rightAux.origin.x > leftAux.size.width) {
                    hasNotch = YES;
                    notchLeft = leftAux.size.width;
                    notchRight = rightAux.origin.x;
                    notchWidth = notchRight - notchLeft;
                }
            }
        }

        // System names list
        NSSet *systemNames = [NSSet setWithObjects:
            @"Control Center", @"Spotlight", @"TextInputMenuAgent",
            @"SystemUIServer", @"Window Server", @"Dock", nil
        ];

        for (NSDictionary *win in windows) {
            NSNumber *layer = win[(NSString *)kCGWindowLayer];
            if (!layer || [layer intValue] != 25) {
                continue;
            }

            NSString *owner = win[(NSString *)kCGWindowOwnerName] ?: @"Unknown";
            NSString *title = win[(NSString *)kCGWindowName] ?: @"";
            pid_t pid = [win[(NSString *)kCGWindowOwnerPID] intValue];
            uint32_t wid = [win[(NSString *)kCGWindowNumber] unsignedIntValue];
            BOOL onscreen = [win[(NSString *)kCGWindowIsOnscreen] boolValue];
            NSDictionary *bounds = win[(NSString *)kCGWindowBounds];

            double x = bounds[@"X"] ? [bounds[@"X"] doubleValue] : 0.0;
            double y = bounds[@"Y"] ? [bounds[@"Y"] doubleValue] : 0.0;
            double width = bounds[@"Width"] ? [bounds[@"Width"] doubleValue] : 0.0;
            double height = bounds[@"Height"] ? [bounds[@"Height"] doubleValue] : 0.0;

            // Resolve NSRunningApplication
            NSRunningApplication *app = [NSRunningApplication runningApplicationWithProcessIdentifier:pid];
            NSString *bundleId = app.bundleIdentifier ?: @"";
            NSString *localizedName = app.localizedName ?: owner;
            BOOL isSystem = [systemNames containsObject:owner];

            // Notch obstruction check
            BOOL obstructed = NO;
            if (hasNotch) {
                double itemRight = x + width;
                if ((itemRight >= (notchLeft - 10.0)) && (x <= (notchRight + 10.0))) {
                    obstructed = YES;
                }
            }

            // Is offscreen check
            BOOL offscreen = (!onscreen) || (x < 0.0);
            if (hasNotch && (x < notchLeft && (x + width) < notchLeft)) {
                // If it is shoved to the left side of the notch, it's out of normal status area
                offscreen = YES;
            }

            // Icon extraction (64x64 PNG in base64)
            NSString *iconBase64 = @"";
            NSImage *appIcon = app.icon;
            if (appIcon) {
                NSSize targetSize = NSMakeSize(64, 64);
                NSImage *resized = [[NSImage alloc] initWithSize:targetSize];
                [resized lockFocus];
                [appIcon drawInRect:NSMakeRect(0, 0, targetSize.width, targetSize.height)
                           fromRect:NSZeroRect
                          operation:NSCompositingOperationCopy
                           fraction:1.0];
                [resized unlockFocus];

                NSData *tiffData = [resized TIFFRepresentation];
                if (tiffData) {
                    NSBitmapImageRep *rep = [NSBitmapImageRep imageRepWithData:tiffData];
                    NSData *pngData = [rep representationUsingType:NSBitmapImageFileTypePNG properties:@{}];
                    if (pngData) {
                        iconBase64 = [pngData base64EncodedStringWithOptions:0];
                    }
                }
            }

            NSDictionary *itemDict = @{
                @"id": @(wid),
                @"pid": @(pid),
                @"owner": owner,
                @"localizedName": localizedName,
                @"title": title,
                @"bundleId": bundleId,
                @"x": @(x),
                @"y": @(y),
                @"width": @(width),
                @"height": @(height),
                @"onscreen": @(onscreen),
                @"obstructed": @(obstructed),
                @"offscreen": @(offscreen),
                @"isSystem": @(isSystem),
                @"iconBase64": iconBase64
            };

            [items addObject:itemDict];
        }

        // Sort items by X coordinate ascending (left to right)
        [items sortUsingComparator:^NSComparisonResult(NSDictionary *a, NSDictionary *b) {
            double ax = [a[@"x"] doubleValue];
            double bx = [b[@"x"] doubleValue];
            if (ax < bx) return NSOrderedAscending;
            if (ax > bx) return NSOrderedDescending;
            return NSOrderedSame;
        }];

        NSDictionary *root = @{
            @"screen": @{
                @"width": @(screenFrame.size.width),
                @"height": @(screenFrame.size.height),
                @"visibleWidth": @(visibleFrame.size.width),
                @"visibleHeight": @(visibleFrame.size.height),
                @"safeAreaTop": @(safeAreaTop),
                @"hasNotch": @(hasNotch),
                @"notchLeft": @(notchLeft),
                @"notchRight": @(notchRight),
                @"notchWidth": @(notchWidth)
            },
            @"totalCount": @([items count]),
            @"items": items
        };

        NSError *error = nil;
        NSData *jsonData = [NSJSONSerialization dataWithJSONObject:root options:0 error:&error];
        if (error || !jsonData) {
            return strdup("{\"error\":\"JSON serialization failed\"}");
        }

        NSString *jsonStr = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
        return strdup([jsonStr UTF8String]);
    }
}

void menubar_free_string(char *s) {
    if (s) {
        free(s);
    }
}

bool menubar_activate_app(pid_t pid) {
    @autoreleasepool {
        NSRunningApplication *app = [NSRunningApplication runningApplicationWithProcessIdentifier:pid];
        if (!app) {
            return false;
        }
        return [app activateWithOptions:NSApplicationActivateAllWindows];
    }
}

bool menubar_click_item(double x, double y) {
    @autoreleasepool {
        CGPoint point = CGPointMake(x, y);
        CGEventRef down = CGEventCreateMouseEvent(NULL, kCGEventLeftMouseDown, point, kCGMouseButtonLeft);
        CGEventRef up = CGEventCreateMouseEvent(NULL, kCGEventLeftMouseUp, point, kCGMouseButtonLeft);

        if (!down || !up) {
            if (down) CFRelease(down);
            if (up) CFRelease(up);
            return false;
        }

        CGEventPost(kCGHIDEventTap, down);
        usleep(30000); // 30ms pause between down and up
        CGEventPost(kCGHIDEventTap, up);

        CFRelease(down);
        CFRelease(up);
        return true;
    }
}

bool menubar_reveal_in_finder(pid_t pid) {
    @autoreleasepool {
        NSRunningApplication *app = [NSRunningApplication runningApplicationWithProcessIdentifier:pid];
        if (!app || !app.bundleURL) {
            return false;
        }
        [[NSWorkspace sharedWorkspace] activateFileViewerSelectingURLs:@[app.bundleURL]];
        return true;
    }
}
