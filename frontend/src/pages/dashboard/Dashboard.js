import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { dashboardService } from '../../services/dashboardService';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [activity, setActivity] = useState([]);
  const [conversionStats, setConversionStats] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch stats
        const statsResponse = await dashboardService.getStats();
        setStats(statsResponse.data);
        
        // Fetch chart data
        const chartResponse = await dashboardService.getChartData();
        setChartData(chartResponse.data);
        
        // Fetch activity
        const activityResponse = await dashboardService.getActivity();
        setActivity(activityResponse.data);
        
        // Fetch conversion stats
        const conversionResponse = await dashboardService.getConversionStats();
        setConversionStats(conversionResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Error loading dashboard data. Please try again.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Prepare chart data
  const customerStatusChart = chartData && {
    labels: chartData.customerStatus.map(item => item.status.charAt(0).toUpperCase() + item.status.slice(1)),
    datasets: [
      {
        data: chartData.customerStatus.map(item => item.count),
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 99, 132, 0.8)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const interactionTypeChart = chartData && {
    labels: chartData.interactionTypes.map(item => item.type.charAt(0).toUpperCase() + item.type.slice(1)),
    datasets: [
      {
        data: chartData.interactionTypes.map(item => item.count),
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)'
        ],
        borderWidth: 1
      }
    ]
  };

  const monthlyInteractionsChart = chartData && {
    labels: chartData.monthlyInteractions.map(item => item.month),
    datasets: [
      {
        label: 'Interactions',
        data: chartData.monthlyInteractions.map(item => item.count),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  // Lead Distribution Chart
  const leadDistributionChart = chartData && {
    labels: chartData.leadDistribution.map(item => item.month),
    datasets: [
      {
        label: 'New Leads',
        data: chartData.leadDistribution.map(item => item.count),
        backgroundColor: 'rgba(255, 159, 64, 0.8)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1
      }
    ]
  };

  // Conversion Rate Chart
  const conversionRateChart = conversionStats && {
    labels: conversionStats.monthlyConversions.map(item => item.month),
    datasets: [
      {
        label: 'Conversion Rate (%)',
        data: conversionStats.monthlyConversions.map(item => item.rate),
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1,
        yAxisID: 'y'
      },
      {
        label: 'Leads',
        data: conversionStats.monthlyConversions.map(item => item.leads),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        type: 'bar',
        yAxisID: 'y1'
      },
      {
        label: 'Conversions',
        data: conversionStats.monthlyConversions.map(item => item.conversions),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        type: 'bar',
        yAxisID: 'y1'
      }
    ]
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Welcome back, <span className="font-medium">{user?.name}</span>!
        </div>
      </div>

      {/* Summary Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Leads Card */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Leads</p>
                <p className="text-2xl font-bold">{stats.counts.customers.lead}</p>
              </div>
            </div>
          </div>

          {/* Total Customers Card */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Customers</p>
                <p className="text-2xl font-bold">{stats.counts.customers.customer}</p>
              </div>
            </div>
          </div>

          {/* Conversion Rate Card */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Conversion Rate</p>
                <p className="text-2xl font-bold">
                  {conversionStats ? `${conversionStats.conversionRate}%` : "0%"}
                </p>
              </div>
            </div>
          </div>

          {/* Time to Convert Card */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Avg. Days to Convert</p>
                <p className="text-2xl font-bold">
                  {conversionStats ? conversionStats.avgDaysToConvert : "0"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Status Distribution */}
        {chartData && (
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Lead Status Distribution</h3>
            <div className="h-64">
              <Pie 
                data={customerStatusChart} 
                options={{ 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }} 
              />
            </div>
          </div>
        )}

        {/* Conversion Rate Over Time */}
        {conversionStats && (
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Lead Conversion Metrics</h3>
            <div className="h-64">
              <Line 
                data={conversionRateChart} 
                options={{ 
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      type: 'linear',
                      display: true,
                      position: 'left',
                      title: {
                        display: true,
                        text: 'Conversion Rate (%)'
                      },
                      min: 0
                    },
                    y1: {
                      type: 'linear',
                      display: true,
                      position: 'right',
                      title: {
                        display: true,
                        text: 'Count'
                      },
                      grid: {
                        drawOnChartArea: false, 
                      },
                      min: 0
                    }
                  }
                }} 
              />
            </div>
          </div>
        )}

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Activity</h3>
          <div className="overflow-y-auto max-h-64">
            {activity.length > 0 ? (
              <ul className="space-y-3">
                {activity.slice(0, 5).map((item, index) => (
                  <li key={index} className="border-l-2 border-blue-500 pl-3 py-1">
                    <div className="text-sm">
                      <span className="font-medium">
                        {item.type === 'customer' && item.data.name}
                        {item.type === 'interaction' && item.data.customer.name}
                        {item.type === 'task' && item.data.title}
                      </span> 
                      {item.type === 'customer' && ' was added'}
                      {item.type === 'interaction' && ` had a ${item.data.type}`}
                      {item.type === 'task' && (
                        item.action === 'completed' ? ' was completed' : ' was created'
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(item.date).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={() => {}} 
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View All Activity
            </button>
          </div>
        </div>
      </div>

      {/* Additional Charts Section */}
      {chartData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monthly Interactions Chart */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Interactions</h3>
            <div className="h-64">
              <Bar 
                data={monthlyInteractionsChart} 
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }} 
              />
            </div>
          </div>

          {/* Lead Distribution Chart */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">New Leads Over Time</h3>
            <div className="h-64">
              <Bar 
                data={leadDistributionChart} 
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="flex flex-wrap gap-4 justify-end">
        <button
          onClick={() => dashboardService.exportCustomers()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          Export Customers
        </button>
        <button
          onClick={() => dashboardService.exportInteractions()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          Export Interactions
        </button>
      </div>
    </div>
  );
};

export default Dashboard; 