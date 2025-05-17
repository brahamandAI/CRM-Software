import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const InteractionList = ({ interactions = [], onDelete }) => {
  const { hasRole, user } = useContext(AuthContext);
  const [expandedId, setExpandedId] = useState(null);

  // Toggle expanded item
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Get interaction icon based on type
  const getInteractionIcon = (type) => {
    switch(type) {
      case 'email':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'call':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        );
      case 'meeting':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'note':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  // Get a readable name for the interaction type
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

  // Check if user can delete an interaction
  const canDelete = (interaction) => {
    if (!onDelete) return false;
    if (hasRole('admin') || hasRole('manager')) return true;
    return user && interaction.createdBy && interaction.createdBy._id === user.id;
  };

  if (!interactions || interactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No interactions recorded yet.
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {interactions.map((interaction) => (
        <div key={interaction._id} className="hover:bg-gray-50">
          <div 
            className="px-6 py-4 cursor-pointer"
            onClick={() => toggleExpand(interaction._id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 p-2 rounded-full ${
                  interaction.type === 'email' ? 'bg-blue-100 text-blue-600' :
                  interaction.type === 'call' ? 'bg-green-100 text-green-600' :
                  interaction.type === 'meeting' ? 'bg-purple-100 text-purple-600' :
                  interaction.type === 'note' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {getInteractionIcon(interaction.type)}
                </div>
                <div>
                  <div className="flex items-center">
                    <h3 className="text-sm font-medium text-gray-900">{interaction.summary}</h3>
                    <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getOutcomeBadgeColor(interaction.outcome)}`}>
                      {interaction.outcome.charAt(0).toUpperCase() + interaction.outcome.slice(1)}
                    </span>
                  </div>
                  <div className="mt-1 flex space-x-2 text-sm text-gray-500">
                    <p>{getTypeName(interaction.type)}</p>
                    <span>&middot;</span>
                    <p>{formatDate(interaction.date)}</p>
                    {interaction.createdBy && (
                      <>
                        <span>&middot;</span>
                        <p>By {interaction.createdBy.name}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                {canDelete(interaction) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(interaction._id);
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
                <Link
                  to={`/interactions/${interaction._id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </Link>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(interaction._id);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className={`w-5 h-5 transform ${expandedId === interaction._id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Expanded Details */}
            {expandedId === interaction._id && (
              <div className="mt-4 text-sm text-gray-700">
                {interaction.details && (
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-900">Details:</h4>
                    <p className="mt-1 whitespace-pre-line">{interaction.details}</p>
                  </div>
                )}
                {interaction.nextAction && (
                  <div>
                    <h4 className="font-medium text-gray-900">Next Action:</h4>
                    <p className="mt-1">{interaction.nextAction}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InteractionList; 