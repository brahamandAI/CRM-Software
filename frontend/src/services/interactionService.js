import api from './api';

export const interactionService = {
  // Get all interactions with optional filtering
  getInteractions: async (params = {}) => {
    try {
      const response = await api.get('/interactions', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error fetching interactions' };
    }
  },
  
  // Get interactions for a specific customer
  getCustomerInteractions: async (customerId) => {
    try {
      const response = await api.get('/interactions', { 
        params: { customerId } 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error fetching customer interactions' };
    }
  },
  
  // Get interaction by ID
  getInteractionById: async (id) => {
    try {
      const response = await api.get(`/interactions/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error fetching interaction' };
    }
  },
  
  // Create new interaction
  createInteraction: async (interactionData) => {
    try {
      const response = await api.post('/interactions', interactionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error creating interaction' };
    }
  },
  
  // Update interaction
  updateInteraction: async (id, interactionData) => {
    try {
      const response = await api.put(`/interactions/${id}`, interactionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error updating interaction' };
    }
  },
  
  // Delete interaction
  deleteInteraction: async (id) => {
    try {
      const response = await api.delete(`/interactions/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error deleting interaction' };
    }
  },
  
  // Export interactions to PDF
  exportInteractionsToPdf: async (params = {}) => {
    try {
      const response = await api.get('/interactions/export/pdf', {
        params,
        responseType: 'blob'
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'interactions.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return { success: true };
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error exporting interactions to PDF' };
    }
  }
}; 