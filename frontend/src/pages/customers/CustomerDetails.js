import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import CustomerAIInsights from '../../components/customers/CustomerAIInsights';

const CustomerDetails = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await axios.get(`/api/customers/${id}`);
        setCustomer(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  if (loading) return <div>Loading customer details...</div>;
  if (error) return <div>Error loading customer: {error}</div>;
  if (!customer) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{customer.name}</h1>

      {/* AI Insights Section */}
      <CustomerAIInsights customerId={id} />

      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Email</p>
            <p className="font-medium">{customer.email}</p>
          </div>
          <div>
            <p className="text-gray-600">Phone</p>
            <p className="font-medium">{customer.phone || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-600">Company</p>
            <p className="font-medium">{customer.company || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-600">Status</p>
            <p className="font-medium capitalize">{customer.status}</p>
          </div>
        </div>
      </div>

      {/* Address Information */}
      {customer.address && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Street</p>
              <p className="font-medium">{customer.address.street || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600">City</p>
              <p className="font-medium">{customer.address.city || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600">State</p>
              <p className="font-medium">{customer.address.state || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600">ZIP Code</p>
              <p className="font-medium">{customer.address.zipCode || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600">Country</p>
              <p className="font-medium">{customer.address.country || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Notes</h2>
        <p className="whitespace-pre-wrap">{customer.notes || 'No notes available.'}</p>
      </div>

      {/* Tags */}
      {customer.tags && customer.tags.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {customer.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetails; 