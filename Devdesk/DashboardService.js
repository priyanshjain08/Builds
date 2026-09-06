// frontend/src/services/DashboardService.js
import ApiService from './ApiService';

const DashboardService = {
  async getDashboardData() {
    return await ApiService.get('/dashboard');
  }
};

export default DashboardService;
