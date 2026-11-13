import React, { useState } from 'react';
import { UserConfig } from '../types/menubar';
import { X, Check, Sliders, Laptop, Eye, Keyboard } from 'lucide-react';

interface SettingsModalProps {
  config: UserConfig;
  onSave: (config: UserConfig) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  config,
  onSave,
  onClose,
}) => {
  const [position, setPosition] = useState(config.floatingBarPosition);
  const [autoHide, setAutoHide] = useState(config.autoHideFloatingBar);
  const [showAll, setShowAll] = useState(config.showAllInFloatingBar);

  const handleSave = () => {
    onSave({
      ...config,
      floatingBarPosition: position,
      autoHideFloatingBar: autoHide,
      showAllInFloatingBar: showAll,
    });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div className="glass-panel" style={{
        width: '460px',
        backgroundColor: '#0f172a',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
        borderRadius: '14px',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={16} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              MenuBarMan Settings
            </h3>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Floating Bar Position */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
              Floating Menu Bar Position
            </label>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Where the floating secondary bar appears when triggered
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: position === 'center-notch' ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                border: position === 'center-notch' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
              }}>
                <input
                  type="radio"
                  name="position"
                  value="center-notch"
                  checked={position === 'center-notch'}
                  onChange={() => setPosition('center-notch')}
                />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>
                    Centered Below MacBook Notch (Recommended)
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    Floats seamlessly underneath the camera notch or center top
                  </div>
                </div>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: position === 'right' ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                border: position === 'right' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
              }}>
                <input
                  type="radio"
                  name="position"
                  value="right"
                  checked={position === 'right'}
                  onChange={() => setPosition('right')}
                />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>
                    Top-Right Below Status Bar
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    Floats under the right-hand status icons
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Behavior toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  Auto-hide Floating Bar
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  Automatically close the floating bar after activating an item
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoHide}
                onChange={(e) => setAutoHide(e.target.checked)}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  Default to Showing All Status Items
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  Show both visible and hidden items in floating bar by default
                </div>
              </div>
              <input
                type="checkbox"
                checked={showAll}
                onChange={(e) => setShowAll(e.target.checked)}
              />
            </label>
          </div>

          {/* Shortcuts Info */}
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <Keyboard size={16} color="var(--accent-indigo)" />
            <div>
              Click the <strong style={{ color: '#fff' }}>MenuBarMan</strong> icon in your macOS menu bar anytime to toggle the Floating Bar!
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
        }}>
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary">
            <Check size={13} />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
};
