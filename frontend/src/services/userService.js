import api from './api';

export const userService = {
  // Get all users (admin only)
  getUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error fetching users' };
    }
  },
  
  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error fetching user' };
    }
  },
  
  // Create new user (admin only)
  createUser: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error creating user' };
    }
  },
  
  // Update user
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error updating user' };
    }
  },
  
  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/users/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error changing password' };
    }
  },
  
  // Delete user (admin only)
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error deleting user' };
    }
  }
}; 