import { useNotifications } from '../context/NotificationContext';
import Icon from '../components/ui/Icon';
import EmptyState from '../components/ui/EmptyState';
import { timeAgo } from '../utils/format';

const NOTIF_ICONS = {
  task_assigned: { icon: 'layers', color: '#3654F4', bg: '#EDF0FE' },
  task_updated: { icon: 'clock', color: '#E8A23D', bg: '#FDF3E3' },
  workspace_invite: { icon: 'workspace', color: '#1FB27A', bg: '#E8F8F1' },
  default: { icon: 'bell', color: '#6B7085', bg: '#F0F1F5' },
};

export default function NotificationsPage() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p>Everything you have been pinged about, in one place.</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-secondary" onClick={markAllRead}>Mark all as read</button>
        )}
      </div>

      <div className="card card-flush">
        {notifications.length === 0 ? (
          <EmptyState icon="bell" title="No notifications yet" description="You'll see task assignments, workspace invites, and updates here." />
        ) : (
          notifications.map((n) => {
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
      </div>
    </div>
  );
}
