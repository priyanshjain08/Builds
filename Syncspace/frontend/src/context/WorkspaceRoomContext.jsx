import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { WorkspaceAPI } from '../api/resources';
import { useSocket } from './SocketContext';

const WorkspaceRoomContext = createContext(null);

/**
 * Loads a single workspace's detail (members, projects summary, activity, presence),
 * joins its Socket.IO room for the lifetime of the component, and keeps that data
 * live as real-time events arrive. Rendered once per workspace by WorkspaceLayout.
 */
export function WorkspaceRoomProvider({ workspaceId, children }) {
  const { socket, connected } = useSocket();
  const [workspace, setWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activity, setActivity] = useState([]);
  const [myRole, setMyRole] = useState(null);
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await WorkspaceAPI.get(workspaceId);
      setWorkspace(data.workspace);
      setMembers(data.members);
      setProjects(data.projects);
      setActivity(data.activity);
      setMyRole(data.myRole);
      setOnlineUserIds(data.onlineUserIds || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not load this workspace.');
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    load();
  }, [load]);

  // Join/leave the workspace's socket room whenever the socket connects or the workspace changes.
  useEffect(() => {
    if (!socket || !connected || !workspaceId) return;
    socket.emit('workspace:join', workspaceId);
    return () => socket.emit('workspace:leave', workspaceId);
  }, [socket, connected, workspaceId]);

  useEffect(() => {
    if (!socket) return;

    const onPresence = (data) => {
      if (data.workspaceId === workspaceId) setOnlineUserIds(data.onlineUserIds);
    };
    const onActivity = (activityRow) => {
      if (activityRow.workspace_id === workspaceId) setActivity((prev) => [activityRow, ...prev].slice(0, 40));
    };
    const onMemberAdded = (member) => setMembers((prev) => [...prev, member]);
    const onMemberRemoved = ({ userId }) => setMembers((prev) => prev.filter((m) => m.id !== userId));
    const onWorkspaceUpdated = (updated) => setWorkspace((prev) => ({ ...prev, ...updated }));
    const onProjectCreated = (project) => setProjects((prev) => [project, ...prev]);
    const onProjectUpdated = (project) =>
      setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, ...project } : p)));
    const onProjectDeleted = ({ id }) => setProjects((prev) => prev.filter((p) => p.id !== id));

    socket.on('presence:update', onPresence);
    socket.on('activity:new', onActivity);
    socket.on('member:added', onMemberAdded);
    socket.on('member:removed', onMemberRemoved);
    socket.on('workspace:updated', onWorkspaceUpdated);
    socket.on('project:created', onProjectCreated);
    socket.on('project:updated', onProjectUpdated);
    socket.on('project:deleted', onProjectDeleted);

    return () => {
      socket.off('presence:update', onPresence);
      socket.off('activity:new', onActivity);
      socket.off('member:added', onMemberAdded);
      socket.off('member:removed', onMemberRemoved);
      socket.off('workspace:updated', onWorkspaceUpdated);
      socket.off('project:created', onProjectCreated);
      socket.off('project:updated', onProjectUpdated);
      socket.off('project:deleted', onProjectDeleted);
    };
  }, [socket, workspaceId]);

  return (
    <WorkspaceRoomContext.Provider
      value={{ workspace, members, projects, activity, myRole, onlineUserIds, loading, error, reload: load }}
    >
      {children}
    </WorkspaceRoomContext.Provider>
  );
}

export function useWorkspaceRoom() {
  const ctx = useContext(WorkspaceRoomContext);
  if (!ctx) throw new Error('useWorkspaceRoom must be used within WorkspaceRoomProvider');
  return ctx;
}
