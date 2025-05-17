import React, { useState } from 'react';

const InteractionForm = ({ interaction = null, onSubmit, onCancel }) => {
  const isEditMode = !!interaction;
  
  const [formData, setFormData] = useState({
    type: interaction?.type || 'email',
    summary: interaction?.summary || '',
    details: interaction?.details || '',
    date: interaction?.date ? new Date(interaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    outcome: interaction?.outcome || 'neutral',
    nextAction: interaction?.nextAction || ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

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
        {/* Interaction Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Type *
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="email">Email</option>
            <option value="call">Phone Call</option>
            <option value="meeting">Meeting</option>
            <option value="note">Note</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* Summary */}
        <div className="md:col-span-2">
          <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
            Summary *
          </label>
          <input
            type="text"
            id="summary"
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Brief summary of the interaction"
          />
        </div>
        
        {/* Details */}
        <div className="md:col-span-2">
          <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">
            Details
          </label>
          <textarea
            id="details"
            name="details"
            value={formData.details}
            onChange={handleChange}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Detailed notes about the interaction"
          />
        </div>
        
        {/* Outcome */}
        <div>
          <label htmlFor="outcome" className="block text-sm font-medium text-gray-700 mb-1">
            Outcome
          </label>
          <select
            id="outcome"
            name="outcome"
            value={formData.outcome}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
            <option value="neutral">Neutral</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        
        {/* Next Action */}
        <div>
          <label htmlFor="nextAction" className="block text-sm font-medium text-gray-700 mb-1">
            Next Action
          </label>
          <input
            type="text"
            id="nextAction"
            name="nextAction"
            value={formData.nextAction}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="What to do next"
          />
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
            isEditMode ? 'Update Interaction' : 'Add Interaction'
          )}
        </button>
      </div>
    </form>
  );
};

export default InteractionForm; 