import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import InteractionForm from '../components/interactions/InteractionForm';
import axios from 'axios';
import { format } from 'date-fns';

const Interactions = () => {
  const { user } = useAuth();
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    dateRange: '30',
    outcome: '',
    search: ''
  });
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  // Fetch interactions and customers
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching interactions and customers...');
        const [interactionsRes, customersRes] = await Promise.all([
          axios.get('/api/interactions'),
          axios.get('/api/customers')
        ]);
        
        console.log('Fetched data:', {
          interactions: interactionsRes.data.data,
          customers: customersRes.data.data
        });
        
        setInteractions(interactionsRes.data.data);
        setCustomers(customersRes.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter interactions based on criteria
  const filteredInteractions = interactions.filter(interaction => {
    const matchesType = !filters.type || interaction.type === filters.type;
    const matchesOutcome = !filters.outcome || interaction.outcome === filters.outcome;
    
    const date = new Date(interaction.date);
    const now = new Date();
    const daysDiff = (now - date) / (1000 * 60 * 60 * 24);
    const matchesDate = !filters.dateRange || daysDiff <= parseInt(filters.dateRange);

    const searchTerm = filters.search.toLowerCase();
    const matchesSearch = !searchTerm || 
      interaction.summary.toLowerCase().includes(searchTerm) ||
      interaction.details.toLowerCase().includes(searchTerm);

    return matchesType && matchesOutcome && matchesDate && matchesSearch;
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c._id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  };

  const getInteractionTypeLabel = (type) => {
    const types = {
      call: 'Phone Call',
      meeting: 'Meeting',
      email: 'Email',
      video_call: 'Video Call',
      site_visit: 'Site Visit',
      demo: 'Product Demo',
      support: 'Support Ticket',
      social: 'Social Media',
      chat: 'Live Chat'
    };
    return types[type] || type;
  };

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
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getOutcomeLabel = (outcome) => {
    const outcomes = {
      positive: '✅ Positive',
      negative: '❌ Negative',
      neutral: '➖ Neutral',
      need_follow_up: '⏳ Needs Follow-up',
      deal_closed: '🎯 Deal Closed',
      deal_lost: '❌ Deal Lost',
      postponed: '⏰ Postponed',
      escalated: '⚠️ Escalated'
    };
    return outcomes[outcome] || outcome;
  };

  const handleNewInteraction = (customerId) => {
    console.log('Opening new interaction form with customer:', customerId);
    setSelectedCustomer(customerId);
    setShowForm(true);
  };

  const handleInteractionCreated = (newInteraction) => {
    console.log('New interaction created:', newInteraction);
    setInteractions(prev => [newInteraction, ...prev]);
    setShowForm(false);
    setSelectedCustomer(null);
  };

  // Add logging for modal state
  useEffect(() => {
    console.log('Modal state:', { showForm, selectedCustomer });
  }, [showForm, selectedCustomer]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="animate-pulse max-w-7xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Stats */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Customer Interactions
              </h1>
              <p className="text-gray-600 mt-2">Track and manage all customer communications</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-blue-100 text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-blue-100 text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>
              <Link
                to="/"
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Home</span>
              </Link>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2 transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>New Interaction</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Interactions</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{interactions.length}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-500 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  12%
                </span>
                <span className="text-gray-400 ml-2">vs last month</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Positive Outcomes</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {interactions.filter(i => i.outcome === 'positive').length}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-500 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  8%
                </span>
                <span className="text-gray-400 ml-2">vs last month</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Needs Follow-up</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {interactions.filter(i => i.outcome === 'need_follow_up').length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-yellow-500 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  5%
                </span>
                <span className="text-gray-400 ml-2">vs last month</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Deals Closed</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {interactions.filter(i => i.outcome === 'deal_closed').length}
                  </p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-500 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  15%
                </span>
                <span className="text-gray-400 ml-2">vs last month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interaction Type
              </label>
              <div className="relative">
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 pl-3 pr-10 py-2 text-base"
                >
                  <option value="">All Types</option>
                  <option value="call">Phone Call</option>
                  <option value="meeting">Meeting</option>
                  <option value="email">Email</option>
                  <option value="video_call">Video Call</option>
                  <option value="site_visit">Site Visit</option>
                  <option value="demo">Product Demo</option>
                  <option value="support">Support Ticket</option>
                  <option value="social">Social Media</option>
                  <option value="chat">Live Chat</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <div className="relative">
                <select
                  name="dateRange"
                  value={filters.dateRange}
                  onChange={handleFilterChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 pl-3 pr-10 py-2 text-base"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="180">Last 6 months</option>
                  <option value="365">Last year</option>
                  <option value="">All time</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Outcome
              </label>
              <div className="relative">
                <select
                  name="outcome"
                  value={filters.outcome}
                  onChange={handleFilterChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 pl-3 pr-10 py-2 text-base"
                >
                  <option value="">All Outcomes</option>
                  <option value="positive">Positive</option>
                  <option value="negative">Negative</option>
                  <option value="neutral">Neutral</option>
                  <option value="need_follow_up">Needs Follow-up</option>
                  <option value="deal_closed">Deal Closed</option>
                  <option value="deal_lost">Deal Lost</option>
                  <option value="postponed">Postponed</option>
                  <option value="escalated">Escalated</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search interactions..."
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 pl-10 py-2 text-base"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal for New Interaction */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600/75 overflow-y-auto h-full w-full z-[9999] backdrop-blur-sm flex items-center justify-center">
            <div className="relative mx-auto p-8 w-full max-w-4xl bg-white rounded-2xl shadow-2xl transform transition-all">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    New Interaction
                  </h2>
                  <p className="text-gray-500 mt-1">Select a customer to start recording the interaction</p>
                </div>
                <button
                  onClick={() => {
                    console.log('Closing modal');
                    setShowForm(false);
                    setSelectedCustomer(null);
                  }}
                  className="text-gray-400 hover:text-gray-500 transition-colors p-2 hover:bg-gray-100 rounded-full"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {!selectedCustomer ? (
                <div>
                  <div className="mb-6">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search customers..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onChange={(e) => {
                          const searchTerm = e.target.value.toLowerCase();
                          const filtered = customers.filter(c => 
                            c.name.toLowerCase().includes(searchTerm) || 
                            c.company?.toLowerCase().includes(searchTerm)
                          );
                          setFilteredCustomers(filtered);
                        }}
                      />
                      <div className="absolute left-3 top-2.5">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                    {(filteredCustomers || customers).map(customer => (
                      <button
                        key={customer._id}
                        onClick={() => handleNewInteraction(customer._id)}
                        className="text-left p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md group"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                              {customer.name}
                            </div>
                            {customer.company && (
                              <div className="text-sm text-gray-500 mt-1">
                                {customer.company}
                              </div>
                            )}
                            {customer.email && (
                              <div className="text-sm text-gray-500 mt-1 flex items-center">
                                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {customer.email}
                              </div>
                            )}
                          </div>
                          <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <InteractionForm
                  customerId={selectedCustomer}
                  onSuccess={handleInteractionCreated}
                />
              )}
            </div>
          </div>
        )}

        {/* Interactions List/Grid */}
        {filteredInteractions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No interactions found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your filters or create a new interaction.</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-4">
            {filteredInteractions.map(interaction => (
              <div
                key={interaction._id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-100 transform hover:scale-[1.01]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 p-3 rounded-xl ${
                      interaction.type === 'email' ? 'bg-blue-100 text-blue-600' :
                      interaction.type === 'call' ? 'bg-green-100 text-green-600' :
                      interaction.type === 'meeting' ? 'bg-purple-100 text-purple-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {getInteractionIcon(interaction.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {interaction.summary}
                      </h3>
                      <div className="mt-2 flex items-center space-x-3 text-sm text-gray-500">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {format(new Date(interaction.date), 'MMM d, yyyy h:mm a')}
                        </span>
                        <span>•</span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {getCustomerName(interaction.customer)}
                        </span>
                      </div>
                      {interaction.details && (
                        <p className="mt-3 text-gray-600 bg-gray-50 p-3 rounded-lg">{interaction.details}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-3">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                      interaction.outcome === 'positive' ? 'bg-green-100 text-green-800' :
                      interaction.outcome === 'negative' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getOutcomeLabel(interaction.outcome)}
                    </span>
                    {interaction.nextAction && (
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{interaction.nextAction}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInteractions.map(interaction => (
              <div
                key={interaction._id}
                className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-all duration-200 border border-gray-100 transform hover:scale-[1.02]"
              >
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 p-3 rounded-xl ${
                    interaction.type === 'email' ? 'bg-blue-100 text-blue-600' :
                    interaction.type === 'call' ? 'bg-green-100 text-green-600' :
                    interaction.type === 'meeting' ? 'bg-purple-100 text-purple-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {getInteractionIcon(interaction.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {interaction.summary}
                    </h3>
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {format(new Date(interaction.date), 'MMM d, yyyy')}
                    </div>
                    <div className="mt-2 text-xs text-gray-600 truncate flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {getCustomerName(interaction.customer)}
                    </div>
                  </div>
                  <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium ${
                    interaction.outcome === 'positive' ? 'bg-green-100 text-green-800' :
                    interaction.outcome === 'negative' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getOutcomeLabel(interaction.outcome)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Interactions; 