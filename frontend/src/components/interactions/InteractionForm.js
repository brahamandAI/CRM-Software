import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const InteractionForm = ({ customerId, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState(null);
  
  const [formData, setFormData] = useState({
    type: 'call',
    channel: 'phone',
    direction: 'outbound',
    purpose: 'follow_up',
    status: 'completed',
    priority: 'medium',
    summary: '',
    details: '',
    nextAction: '',
    nextActionDate: '',
    outcome: 'positive',
    duration: 0,
    sentiment: 'neutral'
  });

  // Interaction Type Options
  const typeOptions = [
    { value: 'call', label: 'Phone Call' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'email', label: 'Email' },
    { value: 'video_call', label: 'Video Call' },
    { value: 'site_visit', label: 'Site Visit' },
    { value: 'demo', label: 'Product Demo' },
    { value: 'support', label: 'Support Ticket' },
    { value: 'social', label: 'Social Media' },
    { value: 'chat', label: 'Live Chat' }
  ];

  // Channel Options
  const channelOptions = [
    { value: 'phone', label: 'Phone' },
    { value: 'teams', label: 'Microsoft Teams' },
    { value: 'zoom', label: 'Zoom' },
    { value: 'email', label: 'Email' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'twitter', label: 'Twitter' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'website', label: 'Website Chat' },
    { value: 'in_person', label: 'In Person' }
  ];

  // Purpose Options
  const purposeOptions = [
    { value: 'follow_up', label: 'Follow Up' },
    { value: 'sales_pitch', label: 'Sales Pitch' },
    { value: 'demo', label: 'Product Demo' },
    { value: 'negotiation', label: 'Price Negotiation' },
    { value: 'support', label: 'Technical Support' },
    { value: 'complaint', label: 'Complaint Resolution' },
    { value: 'feedback', label: 'Feedback Collection' },
    { value: 'upsell', label: 'Upsell/Cross-sell' },
    { value: 'renewal', label: 'Contract Renewal' },
    { value: 'onboarding', label: 'Customer Onboarding' },
    { value: 'training', label: 'Training Session' },
    { value: 'consultation', label: 'Consultation' }
  ];

  // Outcome Options
  const outcomeOptions = [
    { value: 'positive', label: 'Positive' },
    { value: 'negative', label: 'Negative' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'need_follow_up', label: 'Needs Follow-up' },
    { value: 'deal_closed', label: 'Deal Closed' },
    { value: 'deal_lost', label: 'Deal Lost' },
    { value: 'postponed', label: 'Postponed' },
    { value: 'escalated', label: 'Escalated' }
  ];

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await axios.get(`/api/customers/${customerId}`);
        setCustomer(response.data.data);
      } catch (error) {
        console.error('Error fetching customer:', error);
      }
    };

    if (customerId) {
      fetchCustomer();
    }
  }, [customerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/interactions', {
        ...formData,
        customer: customerId,
        createdBy: user._id,
        date: new Date(),
      });

      if (response.data.success) {
        onSuccess(response.data.data);
        // Reset form
        setFormData({
          type: 'call',
          channel: 'phone',
          direction: 'outbound',
          purpose: 'follow_up',
          status: 'completed',
          priority: 'medium',
          summary: '',
          details: '',
          nextAction: '',
          nextActionDate: '',
          outcome: 'positive',
          duration: 0,
          sentiment: 'neutral'
        });
      }
    } catch (error) {
      console.error('Error creating interaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info */}
        {customer && (
          <div className="col-span-2 bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Customer: {customer.name}
            </h3>
            <p className="text-sm text-blue-600">
              Company: {customer.company} | Status: {customer.status}
            </p>
          </div>
        )}

        {/* Interaction Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Interaction Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            {typeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Channel */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Channel
          </label>
          <select
            name="channel"
            value={formData.channel}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            {channelOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Direction */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Direction
          </label>
          <select
            name="direction"
            value={formData.direction}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="outbound">Outbound</option>
            <option value="inbound">Inbound</option>
          </select>
        </div>

        {/* Purpose */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Purpose
          </label>
          <select
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            {purposeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Duration (minutes) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration (minutes)
          </label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            min="0"
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Summary */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Summary
          </label>
          <input
            type="text"
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Brief summary of the interaction"
          />
        </div>

        {/* Details */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Details
          </label>
          <textarea
            name="details"
            value={formData.details}
            onChange={handleChange}
            rows="4"
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Detailed notes about the interaction"
          />
        </div>

        {/* Next Action */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Next Action
          </label>
          <input
            type="text"
            name="nextAction"
            value={formData.nextAction}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Next steps to take"
          />
        </div>

        {/* Next Action Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Next Action Date
          </label>
          <input
            type="date"
            name="nextActionDate"
            value={formData.nextActionDate}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Outcome */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Outcome
          </label>
          <select
            name="outcome"
            value={formData.outcome}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            {outcomeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sentiment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer Sentiment
          </label>
          <select
            name="sentiment"
            value={formData.sentiment}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="very_positive">Very Positive</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
            <option value="very_negative">Very Negative</option>
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 text-white rounded-md ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Saving...' : 'Save Interaction'}
        </button>
      </div>
    </form>
  );
};

export default InteractionForm; 