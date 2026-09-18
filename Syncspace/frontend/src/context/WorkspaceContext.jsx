import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { WorkspaceAPI } from '../api/resources';
import { useAuth } from './AuthContext';

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    const { workspaces } = await WorkspaceAPI.list();
    setWorkspaces(workspaces);
    return workspaces;
  }, [user]);

  useEffect(() => {
    if (!user) {
      setWorkspaces([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    refresh().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const createWorkspace = useCallback(async (data) => {
    const { workspace } = await WorkspaceAPI.create(data);
    setWorkspaces((prev) => [workspace, ...prev]);
    return workspace;
  }, []);

  return (
    <WorkspaceContext.Provider value={{ workspaces, loading, refresh, createWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaces() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspaces must be used within WorkspaceProvider');
  return ctx;
}
