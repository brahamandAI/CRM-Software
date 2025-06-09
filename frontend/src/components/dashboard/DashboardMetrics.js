import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DashboardMetrics = ({ timeRange = 'month' }) => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/metrics/dashboard?timeRange=${timeRange}`);
        setMetrics(response.data.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching metrics:', error);
        setError('Failed to load metrics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    // Refresh every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [timeRange]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 p-4 rounded-lg">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 p-4 rounded-lg">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-60 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const revenueData = {
    labels: metrics.revenue.map(item => item.month),
    datasets: [
      {
        label: 'Revenue',
        data: metrics.revenue.map(item => item.amount),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        fill: true,
      }
    ]
  };

  const customerSegmentData = {
    labels: metrics.customerSegments.map(segment => segment.name),
    datasets: [
      {
        data: metrics.customerSegments.map(segment => segment.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
      }
    ]
  };

  const salesPipelineData = {
    labels: metrics.salesPipeline.map(stage => stage.name),
    datasets: [
      {
        label: 'Deals',
        data: metrics.salesPipeline.map(stage => stage.count),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
      },
      {
        label: 'Value',
        data: metrics.salesPipeline.map(stage => stage.value),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
      }
    ]
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-4">Business Metrics</h2>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-600">Total Revenue</h3>
          <p className="text-2xl font-bold text-blue-900">${metrics.totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-blue-600">
            {metrics.revenueGrowth > 0 ? '+' : ''}{metrics.revenueGrowth}% vs last month
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-600">Active Deals</h3>
          <p className="text-2xl font-bold text-green-900">{metrics.activeDeals}</p>
          <p className="text-sm text-green-600">
            Value: ${metrics.dealValue.toLocaleString()}
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-600">Customer LTV</h3>
          <p className="text-2xl font-bold text-purple-900">${metrics.averageLTV.toLocaleString()}</p>
          <p className="text-sm text-purple-600">
            {metrics.ltvGrowth > 0 ? '+' : ''}{metrics.ltvGrowth}% growth
          </p>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-orange-600">CAC</h3>
          <p className="text-2xl font-bold text-orange-900">${metrics.customerAcquisitionCost}</p>
          <p className="text-sm text-orange-600">
            LTV/CAC: {metrics.ltvCacRatio.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <div className="bg-gray-50 rounded p-4">
          <h3 className="text-lg font-medium mb-2">Revenue Trend</h3>
          <div className="h-60">
            <Line
              data={revenueData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  title: {
                    display: true,
                    text: 'Monthly Revenue'
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

        {/* Customer Segments */}
        <div className="bg-gray-50 rounded p-4">
          <h3 className="text-lg font-medium mb-2">Customer Segments</h3>
          <div className="h-60">
            <Doughnut
              data={customerSegmentData}
              options={{
                responsive: true,
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

        {/* Sales Pipeline */}
        <div className="bg-gray-50 rounded p-4">
          <h3 className="text-lg font-medium mb-2">Sales Pipeline</h3>
          <div className="h-60">
            <Bar
              data={salesPipelineData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top'
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
    </div>
  );
};

export default DashboardMetrics; 