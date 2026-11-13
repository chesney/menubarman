import React, { useState, useEffect } from 'react';
import { MenuBarState, MenuBarItem } from '../types/menubar';
import { menubarService } from '../services/menubarService';
import {
  Sparkles,
  X,
  ExternalLink,
  Eye,
  EyeOff,
  Search,
  AlertTriangle
} from 'lucide-react';

export const IceBar: React.FC = () => {
  const [state, setState] = useState<MenuBarState | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTooltip, setActiveTooltip] = useState<MenuBarItem | null>(null);

  const fetchData = async () => {
    try {
      const data = await menubarService.getMenuBarState();
      setState(data);
    } catch (err) {
      console.error('Failed to get menu bar state in IceBar:', err);
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
      await menubarService.openMainWindow();
    } catch (err) {
      console.error('Failed to open dashboard:', err);
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
        maxWidth: '700px',
        width: '100%',
      }}>
        {/* Brand / Drag Handle */}
        <div
          data-tauri-drag-region
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            paddingRight: '8px',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            cursor: 'grab',
            flexShrink: 0,
          }}
          title="Drag to reposition floating bar"
        >
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Sparkles size={13} color="#ffffff" />
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '-0.01em', color: '#f8fafc' }}>
            IceBar
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

        {/* Controls: Toggle All/Hidden, Open Dashboard, Close */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
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
            }}
            title={showAll ? 'Showing all items (click to show only hidden)' : 'Showing hidden items only (click to show all)'}
          >
            {showAll ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>

          {/* Open Main Dashboard */}
          <button
            onClick={handleOpenDashboard}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Open MenuBarMan Dashboard"
          >
            <ExternalLink size={14} />
          </button>

          {/* Close Floating Bar */}
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
            }}
            title="Close Floating Bar"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
