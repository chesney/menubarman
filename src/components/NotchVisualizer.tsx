import React, { useState } from 'react';
import { MenuBarState, MenuBarItem } from '../types/menubar';
import { Apple, AlertTriangle, ShieldCheck, Info } from 'lucide-react';

interface NotchVisualizerProps {
  state: MenuBarState | null;
  onSelectItem: (item: MenuBarItem) => void;
  selectedItemId: number | null;
}

export const NotchVisualizer: React.FC<NotchVisualizerProps> = ({
  state,
  onSelectItem,
  selectedItemId,
}) => {
  const [hoveredItem, setHoveredItem] = useState<MenuBarItem | null>(null);

  if (!state) return null;

  const { screen, items } = state;
  const screenWidth = screen.width || 2056;
  const hasNotch = screen.hasNotch;
  const notchLeft = screen.notchLeft || 918;
  const notchRight = screen.notchRight || 1138;
  const notchWidth = screen.notchWidth || (notchRight - notchLeft);

  // Percentages for CSS positioning
  const notchLeftPercent = (notchLeft / screenWidth) * 100;
  const notchWidthPercent = (notchWidth / screenWidth) * 100;

  return (
    <div className="glass-panel" style={{ padding: '18px 20px', margin: '0 24px 20px 24px' }}>
      {/* Title & Legend */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            MacBook Menu Bar & Notch Geometry Map
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            ({screenWidth}px × {screen.height}px, Top inset: {screen.safeAreaTop}px)
          </span>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-emerald)' }}></span>
            <span style={{ color: 'var(--text-secondary)' }}>Visible</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-amber)' }}></span>
            <span style={{ color: 'var(--text-secondary)' }}>Near Notch / Threat</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-red)' }}></span>
            <span style={{ color: 'var(--text-secondary)' }}>Hidden / Obstructed</span>
          </div>
          {hasNotch && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '12px', height: '6px', borderRadius: '2px', backgroundColor: '#000000', border: '1px solid rgba(255,255,255,0.2)' }}></span>
              <span style={{ color: 'var(--text-secondary)' }}>Hardware Notch</span>
            </div>
          )}
        </div>
      </div>

      {/* The Visual Menu Bar Representation */}
      <div style={{
        position: 'relative',
        height: '46px',
        backgroundColor: 'rgba(10, 14, 20, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.6)',
      }}>
        {/* Left App Menus Simulation */}
        <div style={{
          position: 'absolute',
          left: '12px',
          top: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: 'var(--text-secondary)',
          fontSize: '11px',
          fontWeight: 500,
          pointerEvents: 'none',
        }}>
          <Apple size={14} color="#e2e8f0" />
          <span style={{ fontWeight: 600, color: '#f8fafc' }}>Finder</span>
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Go</span>
          <span>Window</span>
          <span>Help</span>
        </div>

        {/* The Hardware Notch in the Center */}
        {hasNotch && (
          <div style={{
            position: 'absolute',
            left: `${notchLeftPercent}%`,
            width: `${notchWidthPercent}%`,
            top: 0,
            height: '38px',
            backgroundColor: '#030507',
            borderBottomLeftRadius: '10px',
            borderBottomRightRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderTop: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            zIndex: 10,
            boxShadow: '0 4px 10px rgba(0,0,0,0.8)',
          }}>
            {/* Camera Lens Indicator */}
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#111827',
              border: '1.5px solid #374151',
            }} />
            <span style={{
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              color: '#94a3b8',
              letterSpacing: '0.04em',
            }}>
              NOTCH {notchWidth.toFixed(0)}px
            </span>
          </div>
        )}

        {/* Status Items Plotting */}
        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          pointerEvents: 'none',
        }}>
          {items.map((item) => {
            if (item.width <= 0) return null;
            const itemLeftPercent = Math.max(0, Math.min(100, (item.x / screenWidth) * 100));
            const itemWidthPercent = Math.max(0.6, (item.width / screenWidth) * 100);
            const isSelected = selectedItemId === item.id;
            const isNearNotch = hasNotch && item.x >= (notchRight - 100) && item.x <= (notchRight + 120);

            let bg = 'rgba(16, 185, 129, 0.6)';
            let border = 'rgba(16, 185, 129, 0.9)';

            if (item.status === 'obstructed' || !item.onscreen) {
              bg = 'rgba(239, 68, 68, 0.7)';
              border = 'rgba(239, 68, 68, 1)';
            } else if (item.status === 'userhidden') {
              bg = 'rgba(139, 92, 246, 0.7)';
              border = 'rgba(139, 92, 246, 1)';
            } else if (isNearNotch) {
              bg = 'rgba(245, 158, 11, 0.7)';
              border = 'rgba(245, 158, 11, 1)';
            }

            return (
              <div
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectItem(item);
                }}
                onMouseEnter={() => setHoveredItem(item)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  position: 'absolute',
                  left: `${itemLeftPercent}%`,
                  width: `${itemWidthPercent}%`,
                  minWidth: '12px',
                  top: '5px',
                  bottom: '5px',
                  backgroundColor: bg,
                  border: `1px solid ${border}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                  transition: 'all 0.15s ease',
                  zIndex: isSelected ? 20 : 5,
                  transform: isSelected ? 'scaleY(1.15)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isSelected ? '0 0 8px #06b6d4' : 'none',
                }}
                title={`${item.localizedName || item.owner} (X: ${item.x.toFixed(0)}, W: ${item.width.toFixed(0)})`}
              >
                {item.iconBase64 ? (
                  <img
                    src={`data:image/png;base64,${item.iconBase64}`}
                    alt={item.owner}
                    style={{
                      width: '16px',
                      height: '16px',
                      objectFit: 'contain',
                      borderRadius: '2px',
                    }}
                  />
                ) : (
                  <span style={{ fontSize: '9px', color: '#fff', fontWeight: 600 }}>•</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Hover or Selected Item Details Banner */}
      {(hoveredItem || selectedItemId) && (
        <div style={{
          marginTop: '10px',
          padding: '8px 12px',
          borderRadius: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
        }}>
          {(() => {
            const active = hoveredItem || items.find((i) => i.id === selectedItemId);
            if (!active) return null;
            return (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {active.iconBase64 && (
                    <img
                      src={`data:image/png;base64,${active.iconBase64}`}
                      alt={active.owner}
                      style={{ width: '18px', height: '18px', borderRadius: '4px' }}
                    />
                  )}
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {active.localizedName || active.owner}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>PID: {active.pid}</span>
                  <span style={{ color: 'var(--text-muted)' }}>ID: {active.id}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    Bounds: [X: {active.x.toFixed(0)}, Y: {active.y.toFixed(0)}, W: {active.width.toFixed(0)}, H: {active.height.toFixed(0)}]
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {active.status === 'obstructed' && (
                    <span className="badge badge-obstructed">
                      <AlertTriangle size={11} /> Notch Obstructed
                    </span>
                  )}
                  {active.status === 'offscreen' && (
                    <span className="badge badge-offscreen">
                      <AlertTriangle size={11} /> Off-Screen
                    </span>
                  )}
                  {active.status === 'visible' && (
                    <span className="badge badge-visible">
                      <ShieldCheck size={11} /> On-Screen Visible
                    </span>
                  )}
                  {active.status === 'userhidden' && (
                    <span className="badge badge-userhidden">User Hidden</span>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};
