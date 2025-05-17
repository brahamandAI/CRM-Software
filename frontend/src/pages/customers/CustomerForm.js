import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customerService } from '../../services/customerService';
import { useToast } from '../../context/ToastContext';

const CustomerForm = ({ isModal = false, onSubmit, onCancel, initialData = null }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toastContext = useToast();
  const showError = toastContext ? toastContext.showError : () => {};
  
  // Use id from params for standalone page, or treat as new customer in modal
  const isEditMode = !isModal && !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'lead',
    notes: '',
    tags: [],
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Initialize from provided data or fetch from API
  useEffect(() => {
    // If initial data is provided (in modal mode)
    if (initialData) {
      setFormData(initialData);
    } 
    // Fetch customer data if in edit mode
    else if (isEditMode) {
      const fetchCustomer = async () => {
        setLoading(true);
        try {
          const response = await customerService.getCustomerById(id);
          if (response.success) {
            const {
              name,
              email,
              phone,
              company,
              status,
              notes,
              tags,
              address = {}
            } = response.data;
            
            setFormData({
              name,
              email,
              phone,
              company,
              status,
              notes,
              tags: tags || [],
              address: {
                street: address.street || '',
                city: address.city || '',
                state: address.state || '',
                zipCode: address.zipCode || '',
                country: address.country || ''
              }
            });
          } else {
            setError('Failed to load customer data');
            if (showError) showError('Failed to load customer data');
          }
        } catch (err) {
          setError('Error fetching customer data');
          if (showError) showError('Error fetching customer data');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchCustomer();
    }
  }, [id, isEditMode, initialData, showError]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle address fields (they will be in format address.field)
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle tags input
  const handleTagsChange = (e) => {
    const tagsInput = e.target.value;
    // Split by commas and remove whitespace
    const tagsArray = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData((prev) => ({
      ...prev,
      tags: tagsArray
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      // If in modal mode, use the provided onSubmit handler
      if (isModal && onSubmit) {
        onSubmit(formData);
        setSubmitting(false);
        return;
      }
      
      // Otherwise, handle API call directly
      let response;
      
      if (isEditMode) {
        response = await customerService.updateCustomer(id, formData);
      } else {
        response = await customerService.createCustomer(formData);
      }
      
      if (response.success) {
        // Redirect to customer detail page or customer list
        navigate(isEditMode ? `/customers/${id}` : '/customers');
      } else {
        setError(response.message || 'Failed to save customer');
        if (showError) showError(response.message || 'Failed to save customer');
      }
    } catch (err) {
      setError('An error occurred while saving. Please try again.');
      if (showError) showError('An error occurred while saving. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (isModal && onCancel) {
      onCancel();
    } else {
      navigate(isEditMode ? `/customers/${id}` : '/customers');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // The form content itself - reused in both standalone and modal mode
  const formContent = (
    <form onSubmit={handleSubmit} className={isModal ? "" : "p-6 space-y-6"}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Full name"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="email@example.com"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="(123) 456-7890"
          />
        </div>

        {/* Company */}
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
            Company
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Company name"
          />
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
            <option value="lead">Lead</option>
            <option value="customer">Customer</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Tags */}
      <div className="col-span-2">
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
          Tags (comma separated)
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={formData.tags.join(', ')}
          onChange={handleTagsChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g. important, follow-up, potential"
        />
      </div>
      
      {/* Address Section */}
      <div className="col-span-2 mt-4">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Address Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-1">
              Street
            </label>
            <input
              type="text"
              id="address.street"
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              id="address.city"
              name="address.city"
              value={formData.address.city}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="address.state" className="block text-sm font-medium text-gray-700 mb-1">
              State/Province
            </label>
            <input
              type="text"
              id="address.state"
              name="address.state"
              value={formData.address.state}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="address.zipCode" className="block text-sm font-medium text-gray-700 mb-1">
              Zip/Postal Code
            </label>
            <input
              type="text"
              id="address.zipCode"
              name="address.zipCode"
              value={formData.address.zipCode}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="address.country" className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              type="text"
              id="address.country"
              name="address.country"
              value={formData.address.country}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
      
      {/* Notes */}
      <div className="col-span-2">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="4"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Additional information about the customer..."
        ></textarea>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className={`px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
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
            'Save Customer'
          )}
        </button>
      </div>
    </form>
  );

  // If in modal mode, just return the form content
  if (isModal) {
    return (
      <>
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        )}
        {formContent}
      </>
    );
  }

  // Otherwise, return the full page layout
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          {isEditMode ? 'Edit Customer' : 'Add New Customer'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditMode
            ? 'Update customer information'
            : 'Fill out the form below to add a new customer'}
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {formContent}
      </div>
    </div>
  );
};

export default CustomerForm; 