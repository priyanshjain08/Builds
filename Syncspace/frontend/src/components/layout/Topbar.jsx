import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useOutsideClick } from '../../hooks/useOutsideClick';
import { timeAgo } from '../../utils/format';

const NOTIF_ICONS = {
  task_assigned: { icon: 'layers', color: '#3654F4', bg: '#EDF0FE' },
  task_updated: { icon: 'clock', color: '#E8A23D', bg: '#FDF3E3' },
  workspace_invite: { icon: 'workspace', color: '#1FB27A', bg: '#E8F8F1' },
  default: { icon: 'bell', color: '#6B7085', bg: '#F0F1F5' },
};

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const [bellOpen, setBellOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const bellRef = useRef(null);
  const menuRef = useRef(null);
  useOutsideClick(bellRef, () => setBellOpen(false));
  useOutsideClick(menuRef, () => setMenuOpen(false));

  return (
    <header className="topbar">
      <button className="icon-btn mobile-menu-btn" onClick={onMenuClick} aria-label="Open menu">
        <Icon name="menu" size={20} />
      </button>
      <div className="topbar-actions" style={{ marginLeft: 'auto' }}>
        <div style={{ position: 'relative' }} ref={bellRef}>
          <button className="icon-btn" onClick={() => setBellOpen((v) => !v)} aria-label="Notifications">
            <Icon name="bell" size={19} />
          </button>
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute', top: 2, right: 2, width: 8, height: 8, borderRadius: '50%',
                background: 'var(--danger)', border: '2px solid var(--surface)',
              }}
            />
          )}
          {bellOpen && (
            <div className="notif-dropdown">
              <div className="notif-dropdown-head">
                <h4>Notifications</h4>
                {unreadCount > 0 && (
                  <button className="btn btn-ghost btn-sm" onClick={markAllRead}>
                    Mark all read
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="state-block" style={{ padding: 28 }}>
                  <p>You're all caught up.</p>
                </div>
              ) : (
                notifications.slice(0, 8).map((n) => {
                  const meta = NOTIF_ICONS[n.type] || NOTIF_ICONS.default;
                  return (
                    <div
                      key={n.id}
                      className={`notif-item ${n.is_read ? '' : 'unread'}`}
                      onClick={() => !n.is_read && markRead(n.id)}
                      style={{ cursor: n.is_read ? 'default' : 'pointer' }}
                    >
                      <span className="icon" style={{ background: meta.bg, color: meta.color }}>
                        <Icon name={meta.icon} size={16} />
                      </span>
                      <div className="content">
                        <p>{n.content}</p>
                        <time>{timeAgo(n.created_at)}</time>
                      </div>
                    </div>
                  );
                })
              )}
              <div style={{ padding: 10, textAlign: 'center', borderTop: '1px solid var(--border)' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => { setBellOpen(false); navigate('/app/notifications'); }}>
                  View all
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            className="icon-btn"
            style={{ padding: 0, width: 34, height: 34 }}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <Avatar name={user?.name} color={user?.avatar_color} size="sm" />
          </button>
          {menuOpen && (
            <div className="workspace-menu" style={{ background: 'var(--surface)', border: '1px solid var(--border)', width: 180 }}>
              <div
                className="workspace-menu-item"
                style={{ color: 'var(--text)' }}
                onClick={() => { setMenuOpen(false); navigate('/app/profile'); }}
              >
                <Icon name="user" size={16} /> Profile
              </div>
              <div className="workspace-menu-divider" style={{ background: 'var(--border)' }} />
              <div className="workspace-menu-item" style={{ color: 'var(--danger)' }} onClick={logout}>
                <Icon name="logout" size={16} /> Log out
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
