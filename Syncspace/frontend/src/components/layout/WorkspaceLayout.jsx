import { useParams, Outlet } from 'react-router-dom';
import { WorkspaceRoomProvider, useWorkspaceRoom } from '../../context/WorkspaceRoomContext';
import { PageLoading, ErrorState } from '../ui/Loading';

function WorkspaceGate() {
  const { loading, error, reload } = useWorkspaceRoom();
  if (loading) return <PageLoading />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  return <Outlet />;
}

export default function WorkspaceLayout() {
  const { workspaceId } = useParams();
  return (
    <WorkspaceRoomProvider workspaceId={workspaceId}>
      <WorkspaceGate />
    </WorkspaceRoomProvider>
  );
}
