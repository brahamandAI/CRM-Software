import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { customerService } from '../../services/customerService';
import { interactionService } from '../../services/interactionService';
import { AuthContext } from '../../context/AuthContext';
import InteractionForm from './InteractionForm';
import InteractionList from './InteractionList';
import TaskList from '../tasks/TaskList';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useContext(AuthContext);
  
  const [customer, setCustomer] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInteractionForm, setShowInteractionForm] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  // Fetch customer data and interactions
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch customer details
        const customerResponse = await customerService.getCustomerById(id);
        
        if (customerResponse.success) {
          setCustomer(customerResponse.data);
          
          // Fetch interactions for this customer
          const interactionsResponse = await interactionService.getCustomerInteractions(id);
          
          if (interactionsResponse.success) {
            setInteractions(interactionsResponse.data);
          }
        } else {
          setError(customerResponse.message || 'Failed to load customer data');
        }
      } catch (err) {
        setError('Error fetching customer data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // Add new interaction
  const handleAddInteraction = async (interactionData) => {
    try {
      const response = await interactionService.createInteraction({
        ...interactionData,
        customer: id
      });
      
      if (response.success) {
        setInteractions([response.data, ...interactions]);
        setShowInteractionForm(false);
      } else {
        setError(response.message || 'Failed to add interaction');
      }
    } catch (err) {
      setError('Error adding interaction');
      console.error(err);
    }
  };

  // Delete interaction
  const handleDeleteInteraction = async (interactionId) => {
    if (!window.confirm('Are you sure you want to delete this interaction?')) return;
    
    try {
      const response = await interactionService.deleteInteraction(interactionId);
      
      if (response.success) {
        setInteractions(interactions.filter(item => item._id !== interactionId));
      } else {
        setError(response.message || 'Failed to delete interaction');
      }
    } catch (err) {
      setError('Error deleting interaction');
      console.error(err);
    }
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return 'No address provided';
    
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.zipCode) parts.push(address.zipCode);
    if (address.country) parts.push(address.country);
    
    return parts.length > 0 ? parts.join(', ') : 'No address provided';
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'lead':
        return 'bg-yellow-100 text-yellow-800';
      case 'customer':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Tab content mapping
  const tabContent = {
    info: (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1">{customer.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="mt-1">{customer.phone || 'No phone provided'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Company</p>
                <p className="mt-1">{customer.company || 'No company provided'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p className="mt-1">{formatAddress(customer.address)}</p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Last Contact</p>
                <p className="mt-1">
                  {customer.lastContact ? new Date(customer.lastContact).toLocaleDateString() : 'Never contacted'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Tags</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {customer.tags && customer.tags.length > 0 ? (
                    customer.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">No tags</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Assigned To</p>
                <p className="mt-1">
                  {customer.assignedTo ? customer.assignedTo.name : 'Unassigned'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Created On</p>
                <p className="mt-1">
                  {new Date(customer.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
        {customer.notes && (
          <div className="px-6 pb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Notes</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-gray-800 whitespace-pre-line">{customer.notes}</p>
            </div>
          </div>
        )}
      </div>
    ),
    interactions: (
      <>
        {/* Interaction form */}
        {showInteractionForm && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Log New Interaction</h2>
              <InteractionForm 
                onSubmit={handleAddInteraction}
                onCancel={() => setShowInteractionForm(false)}
              />
            </div>
          </div>
        )}
        <InteractionList 
          interactions={interactions} 
          onDelete={handleDeleteInteraction}
        />
      </>
    ),
    tasks: (
      <TaskList customerId={id} />
    )
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
          onClick={() => navigate('/customers')}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
        >
          Back to Customers
        </button>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-700">Customer not found</h2>
          <div className="mt-6">
            <Link
              to="/customers"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Back to Customers
            </Link>
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
          <h1 className="text-2xl font-semibold text-gray-800">{customer.name}</h1>
          <div className="flex items-center mt-1">
            <span 
              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(customer.status)}`}
            >
              {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
            </span>
          </div>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={() => {
              setActiveTab('interactions');
              setShowInteractionForm(!showInteractionForm);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            {showInteractionForm ? 'Cancel' : 'Log Interaction'}
          </button>
          <Link
            to={`/customers/${id}/edit`}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Customer
          </Link>
          <button
            onClick={() => {
              customerService.exportCustomersToPdf({ customerId: id });
            }}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export PDF
          </button>
          <Link
            to="/customers"
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md"
          >
            Back
          </Link>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('info')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'info'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Info
          </button>
          <button
            onClick={() => setActiveTab('interactions')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'interactions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Interactions
          </button>
          <button
            onClick={() => {
              setActiveTab('tasks');
              setShowInteractionForm(false);
            }}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tasks'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Tasks
          </button>
        </nav>
      </div>

      {/* Tab content */}
      {tabContent[activeTab]}
    </div>
  );
};

export default CustomerDetail; 