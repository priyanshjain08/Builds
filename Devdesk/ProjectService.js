// frontend/src/services/ProjectService.js
import ApiService from './ApiService';

const ProjectService = {
  async getAllProjects() {
    return await ApiService.get('/projects');
  },
  
  async getProject(id) {
    return await ApiService.get(`/projects/${id}`);
  },
  
  async createProject(projectData) {
    return await ApiService.post('/projects', projectData);
  },
  
  async updateProject(id, projectData) {
    return await ApiService.put(`/projects/${id}`, projectData);
  },
  
  async deleteProject(id) {
    return await ApiService.delete(`/projects/${id}`);
  },
  
  async addTeamMember(projectId, userId) {
    return await ApiService.post(`/projects/${projectId}/members/${userId}`);
  },
  
  async removeTeamMember(projectId, userId) {
    return await ApiService.delete(`/projects/${projectId}/members/${userId}`);
  },
  
  async searchUsers(query) {
    return await ApiService.get(`/users/search?query=${query}`);
  }
};

export default ProjectService;
