import React, { useState, useEffect, useCallback } from 'react';
import { MenuBarState, MenuBarItem, UserConfig } from './types/menubar';
import { menubarService } from './services/menubarService';
import { Header } from './components/Header';
import { NotchVisualizer } from './components/NotchVisualizer';
import { HiddenItemsShelf } from './components/HiddenItemsShelf';
import { ItemsTable } from './components/ItemsTable';
import { IceBar } from './components/IceBar';
import { SettingsModal } from './components/SettingsModal';
import { AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  // Check if running in floating IceBar mode
  const isIceBarMode = window.location.search.includes('mode=icebar');

  const [state, setState] = useState<MenuBarState | null>(null);
  const [config, setConfig] = useState<UserConfig>({
    hiddenBundleIds: [],
    floatingBarPosition: 'center-notch',
    autoHideFloatingBar: false,
    showAllInFloatingBar: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [floatingBarVisible, setFloatingBarVisible] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Initialize body class
  useEffect(() => {
    if (isIceBarMode) {
      document.body.className = 'mode-icebar';
    } else {
      document.body.className = 'mode-dashboard';
    }
  }, [isIceBarMode]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [barState, userCfg, isFloatingVisible] = await Promise.all([
        menubarService.getMenuBarState(),
        menubarService.getUserConfig(),
        menubarService.isFloatingBarVisible(),
      ]);
      setState(barState);
      setConfig(userCfg);
      setFloatingBarVisible(isFloatingVisible);
    } catch (err: any) {
      console.error('Failed to load menu bar state:', err);
      setError(err?.toString() || 'Failed to communicate with macOS menu bar subsystem');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isIceBarMode) {
      loadData();
      const interval = setInterval(async () => {
        try {
          const fresh = await menubarService.getMenuBarState();
          setState(fresh);
        } catch {
          // ignore background polling errors
        }
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isIceBarMode, loadData]);

  // If IceBar window, render dedicated capsule view
  if (isIceBarMode) {
    return <IceBar />;
  }

  const handleToggleFloatingBar = async () => {
    try {
      const nowVisible = await menubarService.toggleFloatingBar();
      setFloatingBarVisible(nowVisible);
    } catch (err) {
      console.error('Failed to toggle floating bar:', err);
    }
  };

  const handleActivate = async (pid: number) => {
    try {
      await menubarService.activateApp(pid);
    } catch (err) {
      console.error('Failed to activate app:', err);
    }
  };

  const handleClickItem = async (x: number, y: number) => {
    try {
      await menubarService.clickStatusItem(x, y);
    } catch (err) {
      console.error('Failed to click item:', err);
    }
  };

  const handleRevealInFinder = async (pid: number) => {
    try {
      await menubarService.revealInFinder(pid);
    } catch (err) {
      console.error('Failed to reveal in Finder:', err);
    }
  };

  const handleToggleUserHidden = async (target: string, hidden: boolean) => {
    try {
      const updated = await menubarService.toggleItemHidden(target, hidden);
      setConfig(updated);
      await loadData();
    } catch (err) {
      console.error('Failed to toggle hidden:', err);
    }
  };

  const handleSaveSettings = async (newConfig: UserConfig) => {
    try {
      const updated = await menubarService.saveUserConfig(newConfig);
      setConfig(updated);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const hiddenItems = (state?.items || []).filter((item) => item.status !== 'visible');

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      backgroundColor: 'var(--bg-app)',
    }}>
      {/* Header */}
      <Header
        state={state}
        loading={loading}
        onRefresh={loadData}
        onToggleFloatingBar={handleToggleFloatingBar}
        onOpenSettings={() => setSettingsOpen(true)}
        floatingBarVisible={floatingBarVisible}
      />

      {/* Main Content Area */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingTop: '20px',
      }}>
        {error && (
          <div style={{
            margin: '0 24px 20px 24px',
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '12px',
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Visual Notch & Menu Bar Strip */}
        <NotchVisualizer
          state={state}
          onSelectItem={(item) => setSelectedItemId(item.id)}
          selectedItemId={selectedItemId}
        />

        {/* 2. Hidden & Obstructed Items Shelf (User's primary requirement) */}
        {state && (
          <HiddenItemsShelf
            hiddenItems={hiddenItems}
            screen={state.screen}
            onActivate={handleActivate}
            onClickItem={handleClickItem}
            onRevealInFinder={handleRevealInFinder}
            onToggleUserHidden={handleToggleUserHidden}
            onOpenFloatingBar={handleToggleFloatingBar}
          />
        )}

        {/* 3. Comprehensive Menu Bar Items Table */}
        {state && (
          <ItemsTable
            items={state.items}
            onActivate={handleActivate}
            onClickItem={handleClickItem}
            onRevealInFinder={handleRevealInFinder}
            onToggleUserHidden={handleToggleUserHidden}
            onSelectItem={(item) => setSelectedItemId(item.id)}
            selectedItemId={selectedItemId}
          />
        )}
      </main>

      {/* Settings Modal */}
      {settingsOpen && (
        <SettingsModal
          config={config}
          onSave={handleSaveSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
