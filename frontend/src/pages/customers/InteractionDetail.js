import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interactionService } from '../../services/interactionService';
import { customerService } from '../../services/customerService';
import InteractionForm from './InteractionForm';

const InteractionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [interaction, setInteraction] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch interaction and customer data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch interaction details
        const interactionResponse = await interactionService.getInteractionById(id);
        
        if (interactionResponse.success) {
          setInteraction(interactionResponse.data);
          
          // Fetch associated customer
          if (interactionResponse.data.customer) {
            const customerId = typeof interactionResponse.data.customer === 'object' 
              ? interactionResponse.data.customer._id 
              : interactionResponse.data.customer;
              
            const customerResponse = await customerService.getCustomerById(customerId);
            
            if (customerResponse.success) {
              setCustomer(customerResponse.data);
            }
          }
        } else {
          setError(interactionResponse.message || 'Failed to load interaction data');
        }
      } catch (err) {
        setError('Error fetching interaction data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // Handle update interaction
  const handleUpdateInteraction = async (updatedData) => {
    try {
      const response = await interactionService.updateInteraction(id, updatedData);
      
      if (response.success) {
        setInteraction(response.data);
        setIsEditing(false);
      } else {
        setError(response.message || 'Failed to update interaction');
      }
    } catch (err) {
      setError('Error updating interaction');
      console.error(err);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get type name
  const getTypeName = (type) => {
    switch(type) {
      case 'email': return 'Email';
      case 'call': return 'Phone Call';
      case 'meeting': return 'Meeting';
      case 'note': return 'Note';
      case 'other': return 'Other';
      default: return type;
    }
  };

  // Get outcome badge color
  const getOutcomeBadgeColor = (outcome) => {
    switch(outcome) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
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
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!interaction) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-700">Interaction not found</h2>
          <div className="mt-6">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Go Back
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
          <h1 className="text-2xl font-semibold text-gray-800">Interaction Details</h1>
          {customer && (
            <div className="text-gray-600 mt-1">
              <span>Customer: </span>
              <button 
                onClick={() => navigate(`/customers/${customer._id}`)}
                className="text-blue-600 hover:underline"
              >
                {customer.name}
              </button>
            </div>
          )}
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Interaction
            </button>
          )}
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md"
          >
            Back
          </button>
        </div>
      </div>

      {/* Interaction details or edit form */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isEditing ? (
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Edit Interaction</h2>
            <InteractionForm 
              interaction={interaction}
              onSubmit={handleUpdateInteraction}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-start space-x-4 mb-6">
              <div className={`flex-shrink-0 p-3 rounded-full ${
                interaction.type === 'email' ? 'bg-blue-100 text-blue-600' :
                interaction.type === 'call' ? 'bg-green-100 text-green-600' :
                interaction.type === 'meeting' ? 'bg-purple-100 text-purple-600' :
                interaction.type === 'note' ? 'bg-yellow-100 text-yellow-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                {interaction.type === 'email' && (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )}
                {interaction.type === 'call' && (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                )}
                {interaction.type === 'meeting' && (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )}
                {interaction.type === 'note' && (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                )}
                {interaction.type === 'other' && (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{interaction.summary}</h2>
                <div className="mt-1 flex items-center space-x-3">
                  <div className="flex items-center">
                    <span className="text-gray-500">{getTypeName(interaction.type)}</span>
                    <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getOutcomeBadgeColor(interaction.outcome)}`}>
                      {interaction.outcome.charAt(0).toUpperCase() + interaction.outcome.slice(1)}
                    </span>
                  </div>
                  <span>&middot;</span>
                  <p className="text-gray-500">{formatDate(interaction.date)}</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Details</h3>
                  <div className="bg-gray-50 p-4 rounded-md min-h-16">
                    {interaction.details ? (
                      <p className="text-gray-700 whitespace-pre-line">{interaction.details}</p>
                    ) : (
                      <p className="text-gray-500 italic">No details provided</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Next Action</h3>
                  <div className="bg-gray-50 p-4 rounded-md min-h-16">
                    {interaction.nextAction ? (
                      <p className="text-gray-700">{interaction.nextAction}</p>
                    ) : (
                      <p className="text-gray-500 italic">No next action specified</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractionDetail; 