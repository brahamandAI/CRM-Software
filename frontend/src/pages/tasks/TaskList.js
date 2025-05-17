import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { taskService } from '../../services/taskService';
import { AuthContext } from '../../context/AuthContext';
import TaskForm from './TaskForm';

const TaskList = ({ customerId = null }) => {
  const { hasRole, user } = useContext(AuthContext);
  
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  
  // Filters and sorting
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [dueDateFilter, setDueDateFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [sortField, setSortField] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');

  // Fetch tasks
  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        sort: sortField,
        order: sortOrder
      };
      
      if (customerId) {
        params.customerId = customerId;
      }
      
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (dueDateFilter) {
        if (dueDateFilter === 'overdue') {
          params.overdue = true;
        } else if (dueDateFilter === 'today') {
          params.dueToday = true;
        } else if (dueDateFilter === 'week') {
          params.dueThisWeek = true;
        }
      }
      if (assigneeFilter) params.assignedTo = assigneeFilter;
      
      const response = await taskService.getTasks(params);
      
      if (response.success) {
        setTasks(response.data);
      } else {
        setError(response.message || 'Error fetching tasks');
      }
    } catch (err) {
      setError('Failed to fetch tasks. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchTasks();
  }, [customerId, statusFilter, priorityFilter, dueDateFilter, assigneeFilter, sortField, sortOrder]);
  
  // Add new task
  const handleAddTask = async (taskData) => {
    try {
      const response = await taskService.createTask({
        ...taskData,
        customer: customerId || taskData.customer
      });
      
      if (response.success) {
        setTasks([response.data, ...tasks]);
        setShowTaskForm(false);
        setCurrentTask(null);
      } else {
        setError(response.message || 'Failed to add task');
      }
    } catch (err) {
      setError('Error adding task');
      console.error(err);
      throw err;
    }
  };
  
  // Edit task
  const handleEditTask = async (taskData) => {
    try {
      const response = await taskService.updateTask(currentTask._id, taskData);
      
      if (response.success) {
        setTasks(tasks.map(task => 
          task._id === currentTask._id ? response.data : task
        ));
        setShowTaskForm(false);
        setCurrentTask(null);
      } else {
        setError(response.message || 'Failed to update task');
      }
    } catch (err) {
      setError('Error updating task');
      console.error(err);
      throw err;
    }
  };
  
  // Delete task
  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const response = await taskService.deleteTask(id);
      
      if (response.success) {
        setTasks(tasks.filter(task => task._id !== id));
      } else {
        setError(response.message || 'Failed to delete task');
      }
    } catch (err) {
      setError('Error deleting task');
      console.error(err);
    }
  };
  
  // Complete task
  const handleCompleteTask = async (id) => {
    try {
      const response = await taskService.completeTask(id);
      
      if (response.success) {
        setTasks(tasks.map(task => 
          task._id === id ? response.data : task
        ));
      } else {
        setError(response.message || 'Failed to complete task');
      }
    } catch (err) {
      setError('Error completing task');
      console.error(err);
    }
  };

  // Get task status badge color
  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get task priority badge color
  const getPriorityBadgeColor = (priority) => {
    switch(priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };
  
  // Check if task is overdue
  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && !isDueToday(dueDate);
  };
  
  // Check if task is due today
  const isDueToday = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    return due.getDate() === today.getDate() && 
           due.getMonth() === today.getMonth() && 
           due.getFullYear() === today.getFullYear();
  };

  // Export tasks as PDF
  const handleExportPdf = async () => {
    try {
      const params = {};
      if (customerId) params.customerId = customerId;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      
      await taskService.exportTasksToPdf(params);
    } catch (err) {
      setError('Error exporting tasks to PDF');
      console.error(err);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header with action buttons */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {customerId ? 'Customer Tasks' : 'All Tasks'}
        </h2>
        <div className="flex space-x-2 mt-2 md:mt-0">
          <button
            onClick={() => {
              setCurrentTask(null);
              setShowTaskForm(!showTaskForm);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Task
          </button>
          <button
            onClick={handleExportPdf}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export PDF
          </button>
        </div>
      </div>
      
      {/* Filter controls */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="priorityFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              id="priorityFilter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="dueDateFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <select
              id="dueDateFilter"
              value={dueDateFilter}
              onChange={(e) => setDueDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Any Time</option>
              <option value="overdue">Overdue</option>
              <option value="today">Due Today</option>
              <option value="week">Due This Week</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <div className="flex space-x-2">
              <select
                id="sortBy"
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
                <option value="createdAt">Created Date</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
        
        {(statusFilter || priorityFilter || dueDateFilter) && (
          <div className="flex justify-end mt-4">
            <button
              onClick={() => {
                setStatusFilter('');
                setPriorityFilter('');
                setDueDateFilter('');
              }}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Task form */}
      {showTaskForm && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {currentTask ? 'Edit Task' : 'Add New Task'}
            </h3>
            <TaskForm 
              task={currentTask}
              onSubmit={currentTask ? handleEditTask : handleAddTask}
              onCancel={() => {
                setShowTaskForm(false);
                setCurrentTask(null);
              }}
            />
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* Tasks list */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No tasks found</h3>
            <p className="mt-1 text-gray-500">
              {statusFilter || priorityFilter || dueDateFilter ? 
                'Try adjusting your filters' : 
                'Create a new task to get started'}
            </p>
            <button
              onClick={() => {
                setCurrentTask(null);
                setShowTaskForm(true);
              }}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Task
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasks.map((task) => (
                  <tr key={task._id} className={`hover:bg-gray-50 ${task.status === 'completed' ? 'bg-gray-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-start">
                        {task.status === 'completed' ? (
                          <div className="flex-shrink-0 h-5 w-5 text-green-500">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        ) : (
                          <div className="flex-shrink-0 h-5 w-5 text-gray-400">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        )}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {task.title}
                          </div>
                          {task.customer && (
                            <div className="text-xs text-gray-500">
                              Customer: {task.customer.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${isOverdue(task.dueDate) ? 'text-red-600 font-semibold' : 'text-gray-900'} ${isDueToday(task.dueDate) ? 'font-semibold' : ''}`}>
                        {formatDate(task.dueDate)}
                        {isOverdue(task.dueDate) && <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">Overdue</span>}
                        {isDueToday(task.dueDate) && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Today</span>}
                      </div>
                      {task.reminderDate && (
                        <div className="text-xs text-gray-500">
                          Reminder: {formatDate(task.reminderDate)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeColor(task.priority)}`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(task.status)}`}>
                        {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.assignedTo?.name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {task.status !== 'completed' && (
                          <button
                            onClick={() => handleCompleteTask(task._id)}
                            className="text-green-600 hover:text-green-900 flex items-center"
                            title="Mark as completed"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setCurrentTask(task);
                            setShowTaskForm(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          title="Edit task"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                          title="Delete task"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList; 