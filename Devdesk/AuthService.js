// frontend/src/services/AuthService.js
import ApiService from './ApiService';

const AuthService = {
  async register(userData) {
    const response = await ApiService.post('/auth/register', userData);
    if (response.token) {
      ApiService.setToken(response.token);
      ApiService.setUser(response.user);
    }
    return response;
  },
  
  async login(credentials) {
    const response = await ApiService.post('/auth/login', credentials);
    if (response.token) {
      ApiService.setToken(response.token);
      ApiService.setUser(response.user);
    }
    return response;
  },
  
  logout() {
    ApiService.removeToken();
  },
  
  getCurrentUser() {
    return ApiService.getUser();
  },
  
  isAuthenticated() {
    return !!ApiService.getToken();
  }
};

export default AuthService;
