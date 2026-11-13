import React, { useState, useMemo } from 'react';
import { MenuBarItem, ItemStatus } from '../types/menubar';
import {
  Search,
  Filter,
  Play,
  MousePointer,
  Folder,
  Eye,
  EyeOff,
  Layers,
  ShieldCheck,
  AlertTriangle,
  Pin
} from 'lucide-react';

interface ItemsTableProps {
  items: MenuBarItem[];
  onActivate: (pid: number) => void;
  onClickItem: (x: number, y: number) => void;
  onRevealInFinder: (pid: number) => void;
  onToggleUserHidden: (target: string, hidden: boolean) => void;
  onSelectItem: (item: MenuBarItem) => void;
  selectedItemId: number | null;
}

type FilterTab = 'all' | 'hidden' | 'visible' | 'apps' | 'system';

export const ItemsTable: React.FC<ItemsTableProps> = ({
  items,
  onActivate,
  onClickItem,
  onRevealInFinder,
  onToggleUserHidden,
  onSelectItem,
  selectedItemId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Tab filter
      if (activeTab === 'hidden') {
        if (item.status === 'visible') return false;
      } else if (activeTab === 'visible') {
        if (item.status !== 'visible') return false;
      } else if (activeTab === 'apps') {
        if (item.isSystem) return false;
      } else if (activeTab === 'system') {
        if (!item.isSystem) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = (item.localizedName || '').toLowerCase().includes(query);
        const matchesOwner = (item.owner || '').toLowerCase().includes(query);
        const matchesTitle = (item.title || '').toLowerCase().includes(query);
        const matchesBundle = (item.bundleId || '').toLowerCase().includes(query);
        const matchesPid = item.pid.toString().includes(query);
        return matchesName || matchesOwner || matchesTitle || matchesBundle || matchesPid;
      }

      return true;
    });
  }, [items, activeTab, searchQuery]);

  return (
    <div className="glass-panel" style={{ margin: '0 24px 24px 24px', overflow: 'hidden' }}>
      {/* Search & Tabs Toolbar */}
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
      }}>
        {/* Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {(
            [
              { id: 'all', label: 'All Items', count: items.length },
              { id: 'hidden', label: 'Hidden / Obstructed', count: items.filter((i) => i.status !== 'visible').length },
              { id: 'visible', label: 'Visible', count: items.filter((i) => i.status === 'visible').length },
              { id: 'apps', label: 'User Apps', count: items.filter((i) => !i.isSystem).length },
              { id: 'system', label: 'System', count: items.filter((i) => i.isSystem).length },
            ] as { id: FilterTab; label: string; count: number }[]
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 500,
                  backgroundColor: isActive ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                  color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  border: isActive ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{tab.label}</span>
                <span style={{
                  fontSize: '10px',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  backgroundColor: isActive ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          minWidth: '220px',
        }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px' }} />
          <input
            type="text"
            placeholder="Search by app, PID, bundle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 12px 6px 30px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              outline: 'none',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent-cyan)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-color)')}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', maxHeight: '420px', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
          <thead>
            <tr style={{
              borderBottom: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              backgroundColor: 'rgba(0, 0, 0, 0.15)',
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }}>
              <th style={{ padding: '10px 16px', width: '260px' }}>Application</th>
              <th style={{ padding: '10px 16px', width: '160px' }}>PID / Bundle ID</th>
              <th style={{ padding: '10px 16px', width: '180px' }}>Position & Size</th>
              <th style={{ padding: '10px 16px', width: '160px' }}>Status</th>
              <th style={{ padding: '10px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No menu bar items matched your filter or search query
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const isSelected = selectedItemId === item.id;
                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectItem(item)}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: isSelected
                        ? 'rgba(6, 182, 212, 0.08)'
                        : 'transparent',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {/* App Column */}
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(255, 255, 255, 0.04)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          flexShrink: 0,
                        }}>
                          {item.iconBase64 ? (
                            <img
                              src={`data:image/png;base64,${item.iconBase64}`}
                              alt={item.owner}
                              style={{ width: '22px', height: '22px', objectFit: 'contain' }}
                            />
                          ) : (
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>•</span>
                          )}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {item.localizedName || item.owner}
                          </div>
                          {item.title && item.title !== item.owner && (
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {item.title}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* PID / Bundle ID */}
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                        PID: {item.pid}
                      </div>
                      <div style={{
                        fontSize: '10px',
                        color: 'var(--text-muted)',
                        maxWidth: '140px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {item.bundleId || item.owner}
                      </div>
                    </td>

                    {/* Position & Size */}
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                        X: {item.x.toFixed(0)} • W: {item.width.toFixed(0)}px
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        Y: {item.y.toFixed(0)} • H: {item.height.toFixed(0)}px
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '10px 16px' }}>
                      {item.status === 'obstructed' && (
                        <span className="badge badge-obstructed">
                          <AlertTriangle size={11} /> Notch Obstructed
                        </span>
                      )}
                      {item.status === 'offscreen' && (
                        <span className="badge badge-offscreen">
                          <AlertTriangle size={11} /> Off-Screen
                        </span>
                      )}
                      {item.status === 'visible' && (
                        <span className="badge badge-visible">
                          <ShieldCheck size={11} /> Visible
                        </span>
                      )}
                      {item.status === 'userhidden' && (
                        <span className="badge badge-userhidden">User Hidden</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onActivate(item.pid);
                          }}
                          className="btn-secondary"
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                          title="Activate and bring app to front"
                        >
                          <Play size={11} />
                          <span>Activate</span>
                        </button>
                        {item.onscreen && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onClickItem(item.x + item.width / 2, item.y + item.height / 2);
                            }}
                            className="btn-secondary"
                            style={{ padding: '3px 8px', fontSize: '11px' }}
                            title="Simulate click on item"
                          >
                            <MousePointer size={11} />
                            <span>Click</span>
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRevealInFinder(item.pid);
                          }}
                          className="btn-icon"
                          title="Reveal in Finder"
                        >
                          <Folder size={13} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleUserHidden(item.bundleId || item.owner, !item.isUserHidden);
                          }}
                          className="btn-icon"
                          style={{ color: item.isUserHidden ? 'var(--accent-violet)' : 'var(--text-muted)' }}
                          title={item.isUserHidden ? 'Unhide item' : 'Mark as user-hidden'}
                        >
                          <Pin size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
