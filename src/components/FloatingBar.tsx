import React, { useState, useEffect } from 'react';
import { MenuBarState, MenuBarItem } from '../types/menubar';
import { menubarService } from '../services/menubarService';
import {
  X,
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react';

export const FloatingBar: React.FC = () => {
  const [state, setState] = useState<MenuBarState | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTooltip, setActiveTooltip] = useState<MenuBarItem | null>(null);
  const [openingDashboard, setOpeningDashboard] = useState(false);

  const fetchData = async () => {
    try {
      const data = await menubarService.getMenuBarState();
      setState(data);
    } catch (err) {
      console.error('Failed to get menu bar state:', err);
    } finally {
      setLoading(false);
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
        // If on screen, simulate click
        await menubarService.clickStatusItem(item.x + item.width / 2, item.y + item.height / 2);
      } else {
        // If off screen or obstructed, activate app
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

  const displayedItems = (state?.items || []).filter((item) => {
    if (!showAll && item.status === 'visible') {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const name = (item.localizedName || item.owner).toLowerCase();
      return name.includes(q);
    }
    return true;
  });

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4px 8px',
      boxSizing: 'border-box',
      background: 'transparent',
    }}>
      {/* Floating Capsule Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        backgroundColor: 'rgba(15, 21, 32, 0.94)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        borderRadius: '9999px',
        border: '1px solid rgba(255, 255, 255, 0.16)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.65), 0 0 1px rgba(255, 255, 255, 0.3)',
        maxWidth: '720px',
        width: '100%',
      }}>
        {/* Brand / Drag Handle with Barman SVG Icon */}
        <div
          data-tauri-drag-region
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            paddingRight: '10px',
            borderRight: '1px solid rgba(255, 255, 255, 0.12)',
            cursor: 'grab',
            flexShrink: 0,
          }}
          title="Drag to reposition floating bar"
        >
          {/* Unique Barman + Menu Icon */}
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '7px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
          }}>
            <img
              src="/logo.svg"
              alt="MenuBarMan"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '-0.01em', color: '#f8fafc' }}>
            MenuBarMan
          </span>
        </div>

        {/* Scrollable Items Container */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          flex: 1,
          padding: '2px 4px',
        }}>
          {displayedItems.length === 0 ? (
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '0 8px', whiteSpace: 'nowrap' }}>
              {showAll ? 'No items found' : 'No hidden items (click eye to show all)'}
            </div>
          ) : (
            displayedItems.map((item) => {
              const isObstructed = item.status === 'obstructed';
              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  onMouseEnter={() => setActiveTooltip(item)}
                  onMouseLeave={() => setActiveTooltip(null)}
                  style={{
                    position: 'relative',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    border: isObstructed
                      ? '1px solid rgba(245, 158, 11, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.16)';
                    e.currentTarget.style.transform = 'scale(1.08)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {item.iconBase64 ? (
                    <img
                      src={`data:image/png;base64,${item.iconBase64}`}
                      alt={item.owner}
                      style={{ width: '22px', height: '22px', objectFit: 'contain' }}
                    />
                  ) : (
                    <span style={{ fontSize: '10px', color: '#fff' }}>
                      {item.owner.slice(0, 1)}
                    </span>
                  )}

                  {/* Warning indicator dot if obstructed by notch */}
                  {isObstructed && (
                    <span style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-amber)',
                      border: '1px solid #000',
                    }} />
                  )}

                  {/* Tooltip */}
                  {activeTooltip?.id === item.id && (
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      padding: '4px 10px',
                      backgroundColor: '#0f172a',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
                      whiteSpace: 'nowrap',
                      zIndex: 1000,
                      pointerEvents: 'none',
                    }}>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#f8fafc' }}>
                        {item.localizedName || item.owner}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {item.status === 'obstructed' ? 'Notch Obstructed • Click to open' : 'Click to activate'}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Controls: Toggle All/Hidden, Open Dashboard [↗], Close [✕] */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          paddingLeft: '8px',
          borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
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
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            title={showAll ? 'Showing all items (click to show only hidden)' : 'Showing hidden items only (click to show all)'}
          >
            {showAll ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>

          {/* Open Main Dashboard Button ([↗] in the red square) */}
          <button
            onClick={handleOpenDashboard}
            style={{
              background: openingDashboard ? 'rgba(6, 182, 212, 0.25)' : 'transparent',
              border: 'none',
              color: openingDashboard ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = openingDashboard ? 'rgba(6, 182, 212, 0.25)' : 'transparent')}
            title="Open MenuBarMan Dashboard Window"
          >
            <ExternalLink size={15} />
          </button>

          {/* Close Floating Bar */}
          <button
            onClick={handleClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            title="Close Floating Bar"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
export default FloatingBar;
