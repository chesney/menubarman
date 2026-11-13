import React, { useState, useEffect } from 'react';
import { MenuBarState, MenuBarItem } from '../types/menubar';
import { menubarService } from '../services/menubarService';
import {
  X,
  ExternalLink,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';

export const FloatingBar: React.FC = () => {
  const [state, setState] = useState<MenuBarState | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<MenuBarItem | null>(null);
  const [openingDashboard, setOpeningDashboard] = useState(false);

  const fetchData = async () => {
    try {
      const data = await menubarService.getMenuBarState();
      setState(data);
    } catch (err) {
      console.error('Failed to get menu bar state:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleItemClick = async (item: MenuBarItem) => {
    try {
      if (item.onscreen) {
        // If on screen, simulate click at exact coordinates
        await menubarService.clickStatusItem(item.x + item.width / 2, item.y + item.height / 2);
      } else {
        // If off screen or obstructed, activate the app directly
        await menubarService.activateApp(item.pid);
      }
    } catch (err) {
      console.error('Failed to click/activate item:', err);
    }
  };

  const handleClose = async () => {
    try {
      await menubarService.hideFloatingBar();
    } catch (err) {
      console.error('Failed to hide floating bar:', err);
    }
  };

  const handleOpenDashboard = async () => {
    try {
      setOpeningDashboard(true);
      await menubarService.openMainWindow();
    } catch (err) {
      console.error('Failed to open dashboard:', err);
    } finally {
      setTimeout(() => setOpeningDashboard(false), 500);
    }
  };

  // Determine items to display
  const allItems = state?.items || [];
  const hiddenItems = allItems.filter((i) => i.status !== 'visible');
  // If user selected showAll OR if there are no hidden items, display all items so the bar is populated
  const displayedItems = (showAll || hiddenItems.length === 0) ? allItems : hiddenItems;

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 8px',
      boxSizing: 'border-box',
      background: 'transparent',
      overflow: 'hidden',
    }}>
      {/* Sleek Floating Capsule Bar (matches Screenshot 2) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '0 10px',
        height: '38px',
        backgroundColor: 'rgba(16, 20, 30, 0.86)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        borderRadius: '9999px',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        boxShadow: '0 6px 24px rgba(0, 0, 0, 0.55), 0 0 1px rgba(255, 255, 255, 0.25)',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}>
        {/* Discreet Barman Anchor / Drag Handle */}
        <div
          data-tauri-drag-region
          style={{
            display: 'flex',
            alignItems: 'center',
            paddingRight: '6px',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            cursor: 'grab',
            flexShrink: 0,
          }}
          title="MenuBarMan (Drag to reposition)"
        >
          <img
            src="/logo.svg"
            alt="MenuBarMan"
            style={{ width: '20px', height: '20px', borderRadius: '4px', pointerEvents: 'none' }}
          />
        </div>

        {/* Status Items Strip (clean, frameless native macOS look) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          overflowX: 'auto',
          flex: 1,
          height: '100%',
          padding: '0 4px',
          scrollbarWidth: 'none',
        }}>
          {displayedItems.map((item) => {
            const isObstructed = item.status === 'obstructed';
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                onMouseEnter={() => setActiveTooltip(item)}
                onMouseLeave={() => setActiveTooltip(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '0 5px',
                  height: '28px',
                  minWidth: '24px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  position: 'relative',
                  flexShrink: 0,
                  transition: 'background-color 0.12s ease',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.14)')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {item.iconBase64 ? (
                  <img
                    src={`data:image/png;base64,${item.iconBase64}`}
                    alt={item.owner}
                    style={{ width: '18px', height: '18px', objectFit: 'contain' }}
                  />
                ) : (
                  <span style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: 600 }}>
                    {item.owner.slice(0, 2)}
                  </span>
                )}

                {/* Subtle Amber Indicator for Notch Obstruction */}
                {isObstructed && (
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: '#f59e0b',
                    boxShadow: '0 0 4px #f59e0b',
                  }} />
                )}

                {/* Tooltip */}
                {activeTooltip?.id === item.id && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '4px 8px',
                    backgroundColor: '#0f172a',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.6)',
                    whiteSpace: 'nowrap',
                    zIndex: 1000,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#f8fafc' }}>
                      {item.localizedName || item.owner}
                    </span>
                    {isObstructed && (
                      <span style={{ fontSize: '10px', color: '#fbbf24' }}>
                        (Notch)
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Controls: Toggle All/Hidden, Open Dashboard [↗], Close [✕] */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          paddingLeft: '6px',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          flexShrink: 0,
        }}>
          {/* Toggle All / Hidden */}
          <button
            onClick={() => setShowAll(!showAll)}
            style={{
              background: 'transparent',
              border: 'none',
              color: showAll ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.12s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            title={showAll ? 'Showing all items (click for hidden only)' : 'Showing hidden items only (click for all)'}
          >
            {showAll ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>

          {/* Open Main Dashboard Button ([↗]) */}
          <button
            onClick={handleOpenDashboard}
            style={{
              background: openingDashboard ? 'rgba(6, 182, 212, 0.25)' : 'transparent',
              border: 'none',
              color: openingDashboard ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.12s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = openingDashboard ? 'rgba(6, 182, 212, 0.25)' : 'transparent')}
            title="Open MenuBarMan Dashboard Window"
          >
            <ExternalLink size={14} />
          </button>

          {/* Close Floating Bar ([✕]) */}
          <button
            onClick={handleClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.12s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.18)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            title="Close Floating Bar"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
export default FloatingBar;
