import { useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useWorkspaces } from '../../context/WorkspaceContext';
import { useNotifications } from '../../context/NotificationContext';
import { useOutsideClick } from '../../hooks/useOutsideClick';
import CreateWorkspaceModal from '../workspace/CreateWorkspaceModal';

const WORKSPACE_NAV = [
  { to: 'overview', label: 'Overview', icon: 'workspace' },
  { to: 'projects', label: 'Projects', icon: 'projects' },
  { to: 'board', label: 'Board', icon: 'board' },
  { to: 'chat', label: 'Team chat', icon: 'chat' },
  { to: 'members', label: 'Members', icon: 'members' },
  { to: 'settings', label: 'Settings', icon: 'settings' },
];

export default function Sidebar({ open, onNavigate }) {
  const { user, logout } = useAuth();
  const { workspaces, createWorkspace } = useWorkspaces();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const switcherRef = useRef(null);
  useOutsideClick(switcherRef, () => setSwitcherOpen(false));

  const match = location.pathname.match(/\/app\/w\/([^/]+)/);
  const currentWorkspaceId = match ? match[1] : null;
  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId);

  function go(path) {
    navigate(path);
    onNavigate?.();
  }

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <span className="mark">S</span>
        SyncSpace
      </div>

      <div className="workspace-switcher" ref={switcherRef}>
        <button className="workspace-switcher-btn" onClick={() => setSwitcherOpen((v) => !v)}>
          <span
            className="ws-avatar"
            style={{ background: currentWorkspace ? '#3654F4' : '#3a3e50' }}
          >
            {currentWorkspace ? currentWorkspace.name.slice(0, 1).toUpperCase() : 'S'}
          </span>
          <span className="ws-name">{currentWorkspace ? currentWorkspace.name : 'Select workspace'}</span>
          <Icon name="chevronDown" size={16} />
        </button>
        {switcherOpen && (
          <div className="workspace-menu">
            {workspaces.map((w) => (
              <div
                key={w.id}
                className="workspace-menu-item"
                onClick={() => {
                  setSwitcherOpen(false);
                  go(`/app/w/${w.id}/overview`);
                }}
              >
                <span className="ws-avatar avatar-sm" style={{ background: '#3654F4', width: 22, height: 22, fontSize: 10 }}>
                  {w.name.slice(0, 1).toUpperCase()}
                </span>
                {w.name}
              </div>
            ))}
            {workspaces.length > 0 && <div className="workspace-menu-divider" />}
            <div
              className="workspace-menu-item"
              onClick={() => {
                setSwitcherOpen(false);
                setShowCreate(true);
              }}
            >
              <Icon name="plus" size={16} />
              Create workspace
            </div>
          </div>
        )}
      </div>

      <div className="nav-group">
        <NavLink to="/app/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => onNavigate?.()}>
          <Icon name="dashboard" size={18} />
          Dashboard
        </NavLink>
      </div>

      {currentWorkspaceId && (
        <div className="nav-group">
          <div className="nav-label">{currentWorkspace?.name || 'Workspace'}</div>
          {WORKSPACE_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={`/app/w/${currentWorkspaceId}/${item.to}`}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate?.()}
            >
              <Icon name={item.icon} size={18} />
              {item.label}
            </NavLink>
          ))}
        </div>
      )}

      <div className="nav-group">
        <NavLink to="/app/notifications" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => onNavigate?.()}>
          <Icon name="bell" size={18} />
          Notifications
          {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
        </NavLink>
        <NavLink to="/app/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => onNavigate?.()}>
          <Icon name="user" size={18} />
          Profile
        </NavLink>
      </div>

      <div className="sidebar-footer" onClick={() => go('/app/profile')}>
        <Avatar name={user?.name} color={user?.avatar_color} size="sm" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="name">{user?.name}</div>
          <div className="role">{user?.title || user?.email}</div>
        </div>
        <button
          className="icon-btn"
          style={{ color: '#b7bad0' }}
          onClick={(e) => {
            e.stopPropagation();
            logout();
          }}
          aria-label="Log out"
        >
          <Icon name="logout" size={16} />
        </button>
      </div>

      {showCreate && (
        <CreateWorkspaceModal
          onClose={() => setShowCreate(false)}
          onCreated={async (data) => {
            const workspace = await createWorkspace(data);
            go(`/app/w/${workspace.id}/overview`);
            return workspace;
          }}
        />
      )}
    </aside>
  );
}
