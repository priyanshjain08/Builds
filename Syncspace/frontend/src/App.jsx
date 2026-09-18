import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { NotificationProvider } from './context/NotificationContext';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AppLayout from './components/layout/AppLayout';
import WorkspaceLayout from './components/layout/WorkspaceLayout';

import Dashboard from './pages/Dashboard';
import NotificationsPage from './pages/NotificationsPage';
import Profile from './pages/Profile';
import WorkspaceOverview from './pages/WorkspaceOverview';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import KanbanBoard from './pages/KanbanBoard';
import TeamChat from './pages/TeamChat';
import Members from './pages/Members';
import WorkspaceSettings from './pages/WorkspaceSettings';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <WorkspaceProvider>
            <NotificationProvider>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/app" element={<AppLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="profile" element={<Profile />} />

                  <Route path="w/:workspaceId" element={<WorkspaceLayout />}>
                    <Route index element={<Navigate to="overview" replace />} />
                    <Route path="overview" element={<WorkspaceOverview />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="projects/:projectId" element={<ProjectDetails />} />
                    <Route path="board" element={<KanbanBoard />} />
                    <Route path="chat" element={<TeamChat />} />
                    <Route path="members" element={<Members />} />
                    <Route path="settings" element={<WorkspaceSettings />} />
                  </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </NotificationProvider>
          </WorkspaceProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
