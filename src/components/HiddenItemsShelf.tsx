import React from 'react';
import { MenuBarItem, ScreenInfo } from '../types/menubar';
import {
  EyeOff,
  AlertTriangle,
  Play,
  MousePointer,
  Folder,
  Pin,
  CheckCircle2,
  Sparkles,
  Maximize2
} from 'lucide-react';

interface HiddenItemsShelfProps {
  hiddenItems: MenuBarItem[];
  screen: ScreenInfo;
  onActivate: (pid: number) => void;
  onClickItem: (x: number, y: number) => void;
  onRevealInFinder: (pid: number) => void;
  onToggleUserHidden: (target: string, hidden: boolean) => void;
  onOpenFloatingBar: () => void;
}

export const HiddenItemsShelf: React.FC<HiddenItemsShelfProps> = ({
  hiddenItems,
  screen,
  onActivate,
  onClickItem,
  onRevealInFinder,
  onToggleUserHidden,
  onOpenFloatingBar,
}) => {
  return (
    <div style={{ margin: '0 24px 24px 24px' }}>
      {/* Section Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '6px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: 'var(--accent-red)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <EyeOff size={15} />
          </div>
          <div>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Hidden & Notch-Obstructed Menu Items ({hiddenItems.length})
            </h2>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              These status items cannot be seen on your macOS menu bar because they collide with the notch or overflowed off-screen
            </p>
          </div>
        </div>

        {hiddenItems.length > 0 && (
          <button
            onClick={onOpenFloatingBar}
            className="btn-secondary"
            style={{ fontSize: '11px', gap: '5px' }}
          >
            <Maximize2 size={12} />
            <span>Show in Floating Bar</span>
          </button>
        )}
      </div>

      {/* Grid of Hidden Item Cards */}
      {hiddenItems.length === 0 ? (
        <div className="glass-panel" style={{
          padding: '28px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}>
          <CheckCircle2 size={32} color="var(--accent-emerald)" />
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            No Hidden Menu Bar Items Right Now
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '440px' }}>
            All active status bar items are fitting within the available width of your screen. When you open more menu bar apps or switch to an app with wide menus, clipped items will automatically appear here.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '12px',
        }}>
          {hiddenItems.map((item) => {
            const isObstructed = item.status === 'obstructed';
            const isUserHidden = item.status === 'userhidden';

            return (
              <div
                key={item.id}
                className="glass-panel"
                style={{
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  backgroundColor: 'rgba(26, 32, 44, 0.7)',
                  border: isObstructed
                    ? '1px solid rgba(245, 158, 11, 0.3)'
                    : '1px solid rgba(239, 68, 68, 0.25)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  transition: 'transform 0.15s ease, border-color 0.15s ease',
                }}
              >
                {/* Top row: Icon, Name, and Status Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}>
                      {item.iconBase64 ? (
                        <img
                          src={`data:image/png;base64,${item.iconBase64}`}
                          alt={item.owner}
                          style={{ width: '28px', height: '28px', objectFit: 'contain' }}
                        />
                      ) : (
                        <Sparkles size={18} color="var(--accent-cyan)" />
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                        {item.localizedName || item.owner}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        PID: {item.pid} • {item.owner}
                      </div>
                    </div>
                  </div>

                  {/* Badge */}
                  <div>
                    {isObstructed ? (
                      <span className="badge badge-obstructed">
                        <AlertTriangle size={11} /> Blocked by Notch
                      </span>
                    ) : isUserHidden ? (
                      <span className="badge badge-userhidden">User Hidden</span>
                    ) : (
                      <span className="badge badge-offscreen">Off-Screen</span>
                    )}
                  </div>
                </div>

                {/* Reason / Bounds Description */}
                <div style={{
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'rgba(0, 0, 0, 0.25)',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                }}>
                  {isObstructed ? (
                    <div>
                      Positioned at <code style={{ color: 'var(--accent-amber)' }}>X={item.x.toFixed(0)}px</code> (inside Notch zone {screen.notchLeft.toFixed(0)}px – {screen.notchRight.toFixed(0)}px)
                    </div>
                  ) : isUserHidden ? (
                    <div>Marked by you to hide in secondary bar</div>
                  ) : (
                    <div>Pushed left of visible area (<code style={{ color: 'var(--accent-red)' }}>X={item.x.toFixed(0)}px</code>)</div>
                  )}
                </div>

                {/* Actions row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '4px',
                  borderTop: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => onActivate(item.pid)}
                      className="btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '11px' }}
                      title="Activate this app and bring its windows to front"
                    >
                      <Play size={11} />
                      <span>Bring to Front</span>
                    </button>
                    {item.onscreen && (
                      <button
                        onClick={() => onClickItem(item.x + item.width / 2, item.y + item.height / 2)}
                        className="btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        title="Simulate click on the menu bar item"
                      >
                        <MousePointer size={11} />
                        <span>Click</span>
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      onClick={() => onRevealInFinder(item.pid)}
                      className="btn-icon"
                      title="Reveal in Finder"
                    >
                      <Folder size={13} />
                    </button>
                    <button
                      onClick={() => onToggleUserHidden(item.bundleId || item.owner, !item.isUserHidden)}
                      className="btn-icon"
                      style={{ color: item.isUserHidden ? 'var(--accent-violet)' : 'var(--text-muted)' }}
                      title={item.isUserHidden ? 'Unhide item' : 'Mark as user-hidden'}
                    >
                      <Pin size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
