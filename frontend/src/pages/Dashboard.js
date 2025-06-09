import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalCustomers: 0,
    conversionRate: 0,
    avgDaysToConvert: 0,
    recentActivity: [],
    monthlyInteractions: [],
    leadStatus: {},
    leadConversion: {},
    newLeads: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/api/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ icon, title, value, color }) => (
    <div className="bg-[#1a1f2e] rounded-xl p-6 shadow-lg border border-gray-700/30">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-semibold text-white mt-2">{value}</p>
        </div>
        <div className={`${color} rounded-lg p-3`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#9ca3af',
          padding: 20,
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        titleFont: {
          size: 14,
          family: "'Inter', sans-serif"
        },
        bodyFont: {
          size: 13,
          family: "'Inter', sans-serif"
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(75, 85, 99, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          }
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
            <p className="text-gray-400 mt-1">Welcome back!</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-sm text-white">JD</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Leads"
            value={stats.totalLeads}
            color="bg-blue-500/10 text-blue-500"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <StatCard
            title="Total Customers"
            value={stats.totalCustomers}
            color="bg-emerald-500/10 text-emerald-500"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
          />
          <StatCard
            title="Conversion Rate"
            value={`${stats.conversionRate}%`}
            color="bg-violet-500/10 text-violet-500"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
          <StatCard
            title="Avg. Days to Convert"
            value={stats.avgDaysToConvert}
            color="bg-amber-500/10 text-amber-500"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Lead Status Distribution */}
          <div className="bg-[#1a1f2e] rounded-xl p-6 shadow-lg border border-gray-700/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Lead Status Distribution</h2>
              <button className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
            <div className="h-[300px]">
              <Pie data={stats.leadStatus} options={chartOptions} />
            </div>
          </div>

          {/* Lead Conversion Metrics */}
          <div className="bg-[#1a1f2e] rounded-xl p-6 shadow-lg border border-gray-700/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Lead Conversion Metrics</h2>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1.5 text-sm bg-gray-700/50 rounded-lg text-white hover:bg-gray-700 transition-colors">
                  Monthly
                </button>
                <button className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors">
                  Weekly
                </button>
              </div>
            </div>
            <div className="h-[300px]">
              <Line data={stats.leadConversion} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#1a1f2e] rounded-xl p-6 shadow-lg border border-gray-700/30">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            <Link to="/activity" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 py-3 border-b border-gray-700/30 last:border-0">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <div className="flex-1">
                  <p className="text-sm text-white">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 