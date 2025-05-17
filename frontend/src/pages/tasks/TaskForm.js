import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { customerService } from '../../services/customerService';

const TaskForm = ({ task = null, onSubmit, onCancel }) => {
  const isEditMode = !!task;
  
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    reminderDate: task?.reminderDate ? new Date(task.reminderDate).toISOString().split('T')[0] : '',
    priority: task?.priority || 'medium',
    status: task?.status || 'pending',
    assignedTo: task?.assignedTo?._id || task?.assignedTo || '',
    customer: task?.customer?._id || task?.customer || ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Fetch users and customers for dropdown
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResponse = await userService.getUsers();
        setUsers(usersResponse.data || []);
        
        const customersResponse = await customerService.getCustomers({ limit: 100 });
        setCustomers(customersResponse.data || []);
      } catch (err) {
        console.error('Error fetching form data:', err);
        setError('Error loading form data. Please try again.');
      }
    };
    
    fetchData();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      await onSubmit(formData);
      // Form will be cleared/removed by parent component after successful submission
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div className="md:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Task title"
          />
        </div>
        
        {/* Description */}
        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Detailed description of the task"
          />
        </div>
        
        {/* Customer */}
        <div>
          <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-1">
            Related Customer
          </label>
          <select
            id="customer"
            name="customer"
            value={formData.customer}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- None --</option>
            {customers.map(customer => (
              <option key={customer._id} value={customer._id}>
                {customer.name} {customer.company ? `(${customer.company})` : ''}
              </option>
            ))}
          </select>
        </div>
        
        {/* Assigned To */}
        <div>
          <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
            Assigned To *
          </label>
          <select
            id="assignedTo"
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Select User --</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Due Date */}
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
            Due Date *
          </label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* Reminder Date */}
        <div>
          <label htmlFor="reminderDate" className="block text-sm font-medium text-gray-700 mb-1">
            Reminder Date
          </label>
          <input
            type="date"
            id="reminderDate"
            name="reminderDate"
            value={formData.reminderDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* Priority */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        
        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className={`px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 ${
            submitting ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {submitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : (
            isEditMode ? 'Update Task' : 'Create Task'
          )}
        </button>
      </div>
    </form>
  );
};

export default TaskForm; 