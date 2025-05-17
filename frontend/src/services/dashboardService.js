import api from './api';

export const dashboardService = {
  // Get dashboard statistics
  getStats: async () => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error fetching dashboard stats' };
    }
  },
  
  // Get recent activity
  getActivity: async () => {
    try {
      const response = await api.get('/dashboard/activity');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error fetching activity data' };
    }
  },
  
  // Get chart data
  getChartData: async () => {
    try {
      const response = await api.get('/dashboard/charts');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error fetching chart data' };
    }
  },
  
  // Get conversion statistics
  getConversionStats: async () => {
    try {
      const response = await api.get('/dashboard/conversion-stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error fetching conversion statistics' };
    }
  },
  
  // Export customers to CSV
  exportCustomers: async (params = {}) => {
    try {
      const response = await api.get('/dashboard/export/customers', {
        params,
        responseType: 'blob'
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'customers.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return { success: true };
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error exporting customers' };
    }
  },
  
  // Export interactions to CSV
  exportInteractions: async (params = {}) => {
    try {
      const response = await api.get('/dashboard/export/interactions', {
        params,
        responseType: 'blob'
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'interactions.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return { success: true };
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error exporting interactions' };
    }
  }
}; 