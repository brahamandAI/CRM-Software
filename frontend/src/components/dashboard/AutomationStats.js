import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AutomationStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/dashboard/automation-stats');
        setStats(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading automation statistics...</div>;
  if (error) return <div>Error loading automation statistics: {error}</div>;
  if (!stats) return null;

  const workloadChartData = {
    labels: stats.workloadDistribution.map(item => item.agentName),
    datasets: [
      {
        label: 'Active Tasks',
        data: stats.workloadDistribution.map(item => item.taskCount),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  const statusChartData = {
    labels: stats.automatedStatusChanges.map(item => item._id),
    datasets: [
      {
        label: 'Automated Status Changes',
        data: stats.automatedStatusChanges.map(item => item.count),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-4">Automation Statistics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 rounded p-4">
          <h3 className="text-lg font-medium mb-2">Task Management</h3>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Auto-assigned Tasks (30 days):</span>{' '}
              {stats.autoAssignedTasks}
            </p>
            <p>
              <span className="font-medium">Archived Tasks:</span>{' '}
              {stats.archivedTasks}
            </p>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded p-4">
          <h3 className="text-lg font-medium mb-2">Status Changes (30 days)</h3>
          <div className="h-60">
            <Bar
              data={statusChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Automated Status Changes'
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded p-4">
        <h3 className="text-lg font-medium mb-2">Current Workload Distribution</h3>
        <div className="h-60">
          <Bar
            data={workloadChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Tasks per Agent'
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AutomationStats; 