import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import axios from 'axios';

const Settings = () => {
  const { user, token } = useContext(AuthContext);
  const { showSuccess, showError } = useToast();
  
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  
  // General settings state
  const [generalSettings, setGeneralSettings] = useState({
    companyName: 'Brahamand CRM',
    defaultCurrency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h'
  });
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    taskReminders: true,
    leadActivityAlerts: true,
    weeklyReports: true,
    dailyDigest: false
  });
  
  // Handler for general settings form
  const handleGeneralSettingsChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings({
      ...generalSettings,
      [name]: value
    });
  };
  
  // Handler for notification settings form
  const handleNotificationSettingsChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked
    });
  };
  
  // Save general settings
  const saveGeneralSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 800));
      showSuccess('General settings saved successfully');
    } catch (error) {
      showError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };
  
  // Save notification settings
  const saveNotificationSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 800));
      showSuccess('Notification settings saved successfully');
    } catch (error) {
      showError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  // Admin-only system settings
  const isAdmin = user && user.role === 'admin';
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Settings</h1>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('general')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'general'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Notifications
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('system')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'system'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                System Settings
              </button>
            )}
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <form onSubmit={saveGeneralSettings}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Configure your basic application settings.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                      Company Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="companyName"
                        id="companyName"
                        value={generalSettings.companyName}
                        onChange={handleGeneralSettingsChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="defaultCurrency" className="block text-sm font-medium text-gray-700">
                      Default Currency
                    </label>
                    <div className="mt-1">
                      <select
                        id="defaultCurrency"
                        name="defaultCurrency"
                        value={generalSettings.defaultCurrency}
                        onChange={handleGeneralSettingsChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="INR">INR (₹)</option>
                        <option value="JPY">JPY (¥)</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700">
                      Date Format
                    </label>
                    <div className="mt-1">
                      <select
                        id="dateFormat"
                        name="dateFormat"
                        value={generalSettings.dateFormat}
                        onChange={handleGeneralSettingsChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="timeFormat" className="block text-sm font-medium text-gray-700">
                      Time Format
                    </label>
                    <div className="mt-1">
                      <select
                        id="timeFormat"
                        name="timeFormat"
                        value={generalSettings.timeFormat}
                        onChange={handleGeneralSettingsChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="12h">12 Hour (AM/PM)</option>
                        <option value="24h">24 Hour</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-5">
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      'Save Settings'
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <form onSubmit={saveNotificationSettings}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Customize how and when you receive notifications.
                  </p>
                </div>
                
                <div className="mt-6">
                  <fieldset>
                    <legend className="text-base font-medium text-gray-900">Email Notifications</legend>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="emailNotifications"
                            name="emailNotifications"
                            type="checkbox"
                            checked={notificationSettings.emailNotifications}
                            onChange={handleNotificationSettingsChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="emailNotifications" className="font-medium text-gray-700">
                            Email Notifications
                          </label>
                          <p className="text-gray-500">Receive email notifications for important updates.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="taskReminders"
                            name="taskReminders"
                            type="checkbox"
                            checked={notificationSettings.taskReminders}
                            onChange={handleNotificationSettingsChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="taskReminders" className="font-medium text-gray-700">
                            Task Reminders
                          </label>
                          <p className="text-gray-500">Get reminders for upcoming and overdue tasks.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="leadActivityAlerts"
                            name="leadActivityAlerts"
                            type="checkbox"
                            checked={notificationSettings.leadActivityAlerts}
                            onChange={handleNotificationSettingsChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="leadActivityAlerts" className="font-medium text-gray-700">
                            Lead Activity Alerts
                          </label>
                          <p className="text-gray-500">Receive alerts when there is new activity with your leads.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="weeklyReports"
                            name="weeklyReports"
                            type="checkbox"
                            checked={notificationSettings.weeklyReports}
                            onChange={handleNotificationSettingsChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="weeklyReports" className="font-medium text-gray-700">
                            Weekly Reports
                          </label>
                          <p className="text-gray-500">Get a weekly summary of your performance and activity.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="dailyDigest"
                            name="dailyDigest"
                            type="checkbox"
                            checked={notificationSettings.dailyDigest}
                            onChange={handleNotificationSettingsChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="dailyDigest" className="font-medium text-gray-700">
                            Daily Digest
                          </label>
                          <p className="text-gray-500">Receive a daily summary of all activities and upcoming tasks.</p>
                        </div>
                      </div>
                    </div>
                  </fieldset>
                </div>
              </div>

              <div className="pt-5">
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      'Save Preferences'
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* System Settings (Admin Only) */}
          {activeTab === 'system' && isAdmin && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">System Settings</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Advanced settings for system administrators only.
                </p>
              </div>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      These settings affect the entire system. Changes should be made with caution.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-b border-gray-200 py-6">
                <h3 className="text-base font-medium text-gray-900">System Maintenance</h3>
                <div className="mt-4 space-y-4">
                  <button 
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => showSuccess('Database backup initiated')}
                  >
                    Backup Database
                  </button>
                  
                  <button 
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => showSuccess('Cache cleared successfully')}
                  >
                    Clear System Cache
                  </button>
                  
                  <button 
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
                        showSuccess('System logs cleared');
                      }
                    }}
                  >
                    Clear System Logs
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings; 