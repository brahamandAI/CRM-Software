import api from './api';

export const customerService = {
  // Get all customers with optional filtering
  getCustomers: async (params = {}) => {
    try {
      const response = await api.get('/customers', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error fetching customers' };
    }
  },
  
  // Get customer by ID
  getCustomerById: async (id) => {
    try {
      const response = await api.get(`/customers/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error fetching customer' };
    }
  },
  
  // Create new customer
  createCustomer: async (customerData) => {
    try {
      const response = await api.post('/customers', customerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error creating customer' };
    }
  },
  
  // Update customer
  updateCustomer: async (id, customerData) => {
    try {
      const response = await api.put(`/customers/${id}`, customerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error updating customer' };
    }
  },
  
  // Delete customer
  deleteCustomer: async (id) => {
    try {
      const response = await api.delete(`/customers/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error deleting customer' };
    }
  },
  
  // Export customers to PDF
  exportCustomersToPdf: async (params = {}) => {
    try {
      const response = await api.get('/customers/export/pdf', {
        params,
        responseType: 'blob'
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'customers.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return { success: true };
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error exporting customers to PDF' };
    }
  }
}; 