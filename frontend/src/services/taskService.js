import api from './api';

export const taskService = {
  // Get all tasks with optional filtering
  getTasks: async (params = {}) => {
    try {
      const response = await api.get('/tasks', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error fetching tasks' };
    }
  },
  
  // Get tasks for a specific customer
  getCustomerTasks: async (customerId) => {
    try {
      const response = await api.get('/tasks', { 
        params: { customerId } 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error fetching customer tasks' };
    }
  },
  
  // Get task by ID
  getTaskById: async (id) => {
    try {
      const response = await api.get(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error fetching task' };
    }
  },
  
  // Create new task
  createTask: async (taskData) => {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error creating task' };
    }
  },
  
  // Update task
  updateTask: async (id, taskData) => {
    try {
      const response = await api.put(`/tasks/${id}`, taskData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error updating task' };
    }
  },
  
  // Mark task as completed
  completeTask: async (id) => {
    try {
      const response = await api.put(`/tasks/${id}`, { 
        status: 'completed',
        completedAt: new Date()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error completing task' };
    }
  },
  
  // Delete task
  deleteTask: async (id) => {
    try {
      const response = await api.delete(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error deleting task' };
    }
  },
  
  // Export tasks to PDF
  exportTasksToPdf: async (params = {}) => {
    try {
      const response = await api.get('/tasks/export/pdf', {
        params,
        responseType: 'blob'
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'tasks.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return { success: true };
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error exporting tasks to PDF' };
    }
  }
}; 