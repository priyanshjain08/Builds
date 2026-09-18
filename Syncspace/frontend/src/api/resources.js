import { api } from './client';

export const AuthAPI = {
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
};

export const UserAPI = {
  updateProfile: (data) => api.patch('/users/me', data).then((r) => r.data),
  overview: () => api.get('/users/me/overview').then((r) => r.data),
  search: (q) => api.get('/users/search', { params: { q } }).then((r) => r.data),
};

export const DashboardAPI = {
  get: () => api.get('/dashboard').then((r) => r.data),
};

export const WorkspaceAPI = {
  list: () => api.get('/workspaces').then((r) => r.data),
  create: (data) => api.post('/workspaces', data).then((r) => r.data),
  get: (id) => api.get(`/workspaces/${id}`).then((r) => r.data),
  update: (id, data) => api.patch(`/workspaces/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/workspaces/${id}`),
  members: (id) => api.get(`/workspaces/${id}/members`).then((r) => r.data),
  addMember: (id, email) => api.post(`/workspaces/${id}/members`, { email }).then((r) => r.data),
  removeMember: (id, userId) => api.delete(`/workspaces/${id}/members/${userId}`),
  activity: (id) => api.get(`/workspaces/${id}/activity`).then((r) => r.data),
};

export const ProjectAPI = {
  list: (workspaceId, params) => api.get(`/workspaces/${workspaceId}/projects`, { params }).then((r) => r.data),
  create: (workspaceId, data) => api.post(`/workspaces/${workspaceId}/projects`, data).then((r) => r.data),
  get: (workspaceId, projectId) => api.get(`/workspaces/${workspaceId}/projects/${projectId}`).then((r) => r.data),
  update: (workspaceId, projectId, data) =>
    api.patch(`/workspaces/${workspaceId}/projects/${projectId}`, data).then((r) => r.data),
  remove: (workspaceId, projectId) => api.delete(`/workspaces/${workspaceId}/projects/${projectId}`),
};

export const TaskAPI = {
  list: (workspaceId, params) => api.get(`/workspaces/${workspaceId}/tasks`, { params }).then((r) => r.data),
  create: (workspaceId, data) => api.post(`/workspaces/${workspaceId}/tasks`, data).then((r) => r.data),
  update: (workspaceId, taskId, data) =>
    api.patch(`/workspaces/${workspaceId}/tasks/${taskId}`, data).then((r) => r.data),
  remove: (workspaceId, taskId) => api.delete(`/workspaces/${workspaceId}/tasks/${taskId}`),
};

export const MessageAPI = {
  list: (workspaceId, params) => api.get(`/workspaces/${workspaceId}/messages`, { params }).then((r) => r.data),
  send: (workspaceId, content) => api.post(`/workspaces/${workspaceId}/messages`, { content }).then((r) => r.data),
};

export const NotificationAPI = {
  list: () => api.get('/notifications').then((r) => r.data),
  markRead: (id) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.patch('/notifications/read-all'),
};
