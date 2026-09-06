// frontend/src/services/ApiService.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const ApiService = {
  getToken() {
    return localStorage.getItem('token');
  },
  
  setToken(token) {
    localStorage.setItem('token', token);
  },
  
  removeToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  },
  
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  getHeaders() {
    const token = this.getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  },
  
  async get(endpoint) {
    try {
      const response = await axios.get(`${API_URL}${endpoint}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },
  
  async post(endpoint, data) {
    try {
      const response = await axios.post(`${API_URL}${endpoint}`, data, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },
  
  async put(endpoint, data) {
    try {
      const response = await axios.put(`${API_URL}${endpoint}`, data, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },
  
  async delete(endpoint) {
    try {
      const response = await axios.delete(`${API_URL}${endpoint}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },
  
  handleError(error) {
    if (error.response) {
      if (error.response.status === 401) {
        this.removeToken();
        window.location.href = '/login';
      }
      return error.response.data || 'An error occurred';
    }
    return 'Network error';
  }
};

export default ApiService;
