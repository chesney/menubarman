import React from 'react';
import { MenuBarState } from '../types/menubar';
import {
  Eye,
  EyeOff,
  RefreshCw,
  Sliders,
  Laptop,
  Maximize2,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

interface HeaderProps {
  state: MenuBarState | null;
  loading: boolean;
  onRefresh: () => void;
  onToggleFloatingBar: () => void;
  onOpenSettings: () => void;
  floatingBarVisible: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  loading,
  onRefresh,
  onToggleFloatingBar,
  onOpenSettings,
  floatingBarVisible,
}) => {
  const hasNotch = state?.screen.hasNotch ?? false;
  const hiddenCount = state?.hiddenCount ?? 0;
  const totalCount = state?.totalCount ?? 0;
  const visibleCount = state?.visibleCount ?? 0;
  const obstructedCount = state?.obstructedCount ?? 0;

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-glass)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Brand & Subtitle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        }}>
          <img
            src="/logo.svg"
            alt="MenuBarMan"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              MenuBarMan
            </h1>
            <span style={{
              fontSize: '10px',
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: 'rgba(6, 182, 212, 0.15)',
              color: 'var(--accent-cyan)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
            }}>
              v0.1.0 • RUST
            </span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            macOS Menu Bar Inspector & Hidden Items Revealer
          </p>
        </div>
      </div>

      {/* Live Metrics Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Notch Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '8px',
          backgroundColor: hasNotch ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255, 255, 255, 0.04)',
          border: `1px solid ${hasNotch ? 'rgba(245, 158, 11, 0.25)' : 'var(--border-subtle)'}`,
          fontSize: '11px',
          color: hasNotch ? 'var(--accent-amber)' : 'var(--text-secondary)',
        }}>
          <Laptop size={13} />
          <span>{hasNotch ? `Notch ${state?.screen.notchWidth.toFixed(0)}px` : 'Standard Screen'}</span>
        </div>

        {/* Total Items */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-subtle)',
          fontSize: '11px',
          color: 'var(--text-secondary)',
        }}>
          <Eye size={13} color="var(--accent-emerald)" />
          <span>{visibleCount} / {totalCount} Visible</span>
        </div>

        {/* Hidden / Obstructed Items Badge */}
        {hiddenCount > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '8px',
            backgroundColor: obstructedCount > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            border: `1px solid ${obstructedCount > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            fontSize: '11px',
            fontWeight: 600,
            color: obstructedCount > 0 ? 'var(--accent-red)' : 'var(--accent-amber)',
          }} className="pulse-badge">
            <EyeOff size={13} />
            <span>{hiddenCount} Hidden</span>
            {obstructedCount > 0 && (
              <span style={{ fontSize: '10px', opacity: 0.8 }}>({obstructedCount} notched)</span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Toggle Floating Bar Button */}
        <button
          onClick={onToggleFloatingBar}
          className="btn-primary"
          style={{
            background: floatingBarVisible
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
          }}
          title="Toggle the floating secondary bar below your menu bar"
        >
          <Maximize2 size={14} />
          <span>{floatingBarVisible ? 'Hide Floating Bar' : 'Show Floating Bar'}</span>
        </button>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="btn-secondary"
          disabled={loading}
          title="Rescan macOS Menu Bar Windows"
        >
          <RefreshCw size={13} className={loading ? 'spin-icon' : ''} />
          <span>Scan</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="btn-icon"
          title="Settings & Preferences"
        >
          <Sliders size={16} />
        </button>
      </div>
    </header>
  );
};
