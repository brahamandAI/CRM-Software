import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { taskService } from '../../services/taskService';
import TaskForm from './TaskForm';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch task data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await taskService.getTaskById(id);
        
        if (response.success) {
          setTask(response.data);
        } else {
          setError(response.message || 'Failed to load task data');
        }
      } catch (err) {
        setError('Error fetching task data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // Handle update task
  const handleUpdateTask = async (taskData) => {
    try {
      const response = await taskService.updateTask(id, taskData);
      
      if (response.success) {
        setTask(response.data);
        setIsEditing(false);
      } else {
        setError(response.message || 'Failed to update task');
      }
    } catch (err) {
      setError('Error updating task');
      console.error(err);
      throw err;
    }
  };

  // Handle complete task
  const handleCompleteTask = async () => {
    try {
      const response = await taskService.completeTask(id);
      
      if (response.success) {
        setTask(response.data);
      } else {
        setError(response.message || 'Failed to complete task');
      }
    } catch (err) {
      setError('Error completing task');
      console.error(err);
    }
  };

  // Handle delete task
  const handleDeleteTask = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const response = await taskService.deleteTask(id);
      
      if (response.success) {
        navigate('/tasks');
      } else {
        setError(response.message || 'Failed to delete task');
      }
    } catch (err) {
      setError('Error deleting task');
      console.error(err);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get priority badge color
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

  // Get status badge color
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
        <button
          onClick={() => navigate('/tasks')}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
        >
          Back to Tasks
        </button>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-700">Task not found</h2>
          <div className="mt-6">
            <button
              onClick={() => navigate('/tasks')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Back to Tasks
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header with navigation and actions */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Task Details</h1>
          {task.customer && (
            <div className="text-gray-600 mt-1">
              <span>Customer: </span>
              <button 
                onClick={() => navigate(`/customers/${task.customer._id}`)}
                className="text-blue-600 hover:underline"
              >
                {task.customer.name}
              </button>
            </div>
          )}
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          {!isEditing && task.status !== 'completed' && (
            <button
              onClick={handleCompleteTask}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Mark Complete
            </button>
          )}
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Task
            </button>
          )}
          {!isEditing && (
            <button
              onClick={handleDeleteTask}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          )}
          <button
            onClick={() => navigate('/tasks')}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md"
          >
            Back
          </button>
        </div>
      </div>

      {/* Task details or edit form */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isEditing ? (
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Edit Task</h2>
            <TaskForm 
              task={task}
              onSubmit={handleUpdateTask}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Task Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Information</h2>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="mb-4">
                    <h3 className="text-xl font-medium text-gray-900 mb-1">{task.title}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(task.status)}`}>
                        {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeColor(task.priority)}`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                      </span>
                    </div>
                  </div>
                  
                  {task.description && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 whitespace-pre-line">{task.description}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Task Details */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
                <div className="bg-gray-50 p-4 rounded-md space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Due Date</p>
                      <p className="text-sm text-gray-900">{formatDate(task.dueDate)}</p>
                    </div>
                    
                    {task.reminderDate && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Reminder Date</p>
                        <p className="text-sm text-gray-900">{formatDate(task.reminderDate)}</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Assigned To</p>
                      <p className="text-sm text-gray-900">{task.assignedTo?.name || 'Unassigned'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Created By</p>
                      <p className="text-sm text-gray-900">{task.createdBy?.name || 'Unknown'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Created On</p>
                      <p className="text-sm text-gray-900">{formatDate(task.createdAt)}</p>
                    </div>
                    
                    {task.completedAt && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Completed On</p>
                        <p className="text-sm text-gray-900">{formatDate(task.completedAt)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Export to PDF */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={async () => {
                  try {
                    await taskService.exportTasksToPdf({ taskId: task._id });
                  } catch (err) {
                    setError('Error exporting task to PDF');
                    console.error(err);
                  }
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export to PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetail; 