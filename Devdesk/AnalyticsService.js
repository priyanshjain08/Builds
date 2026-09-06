// frontend/src/services/AnalyticsService.js
import ApiService from './ApiService';

const AnalyticsService = {
  async getAnalyticsData() {
    return await ApiService.get('/analytics');
  }
};

export default AnalyticsService;
