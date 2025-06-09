import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const CustomerAIInsights = ({ customerId }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const [leadScore, churnRisk, customer] = await Promise.all([
          axios.get(`/api/ai/lead-score/${customerId}`),
          axios.get(`/api/ai/churn-risk/${customerId}`),
          axios.get(`/api/customers/${customerId}`)
        ]);

        setInsights({
          leadScore: leadScore.data.data.score,
          churnRisk: churnRisk.data.data,
          sentiments: customer.data.data.sentimentHistory || []
        });
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchInsights();
  }, [customerId]);

  if (loading) return <div>Loading AI insights...</div>;
  if (error) return <div>Error loading AI insights: {error}</div>;
  if (!insights) return null;

  // Prepare sentiment trend data
  const sentimentTrend = {
    labels: insights.sentiments
      .slice(-6)
      .map(s => new Date(s.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Sentiment Trend',
        data: insights.sentiments.slice(-6).map(s => 
          s.sentiment === 'positive' ? 1 : 
          s.sentiment === 'negative' ? -1 : 0
        ),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">AI Insights</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded p-4">
          <h3 className="text-lg font-medium mb-3">Lead Score</h3>
          <div className="flex items-center">
            <div 
              className="w-24 h-24 rounded-full border-8 flex items-center justify-center text-xl font-bold"
              style={{
                borderColor: `hsl(${insights.leadScore}, 70%, 50%)`,
                color: `hsl(${insights.leadScore}, 70%, 40%)`
              }}
            >
              {insights.leadScore}
            </div>
            <div className="ml-4">
              <p className="text-gray-600">
                Last updated: {new Date(insights.lastUpdated).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded p-4">
          <h3 className="text-lg font-medium mb-3">Churn Risk</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Risk Level:</span>
              <span 
                className={`font-semibold ${
                  insights.churnRisk.level === 'High' ? 'text-red-600' :
                  insights.churnRisk.level === 'Medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`}
              >
                {insights.churnRisk.level}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Risk Score:</span>
              <span>{insights.churnRisk.riskScore}%</span>
            </div>
            {insights.churnRisk.factors && (
              <div className="mt-2">
                <p className="font-medium">Risk Factors:</p>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {insights.churnRisk.factors.lowInteraction && (
                    <li>Low interaction frequency</li>
                  )}
                  {insights.churnRisk.factors.negativeInteractions && (
                    <li>Recent negative interactions</li>
                  )}
                  {insights.churnRisk.factors.poorTaskCompletion && (
                    <li>Poor task completion rate</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {insights.sentiments.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Sentiment Trend</h3>
          <div className="h-60">
            <Line
              data={sentimentTrend}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    min: -1,
                    max: 1,
                    ticks: {
                      callback: value => 
                        value === 1 ? 'Positive' :
                        value === 0 ? 'Neutral' :
                        value === -1 ? 'Negative' : ''
                    }
                  }
                },
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: context => 
                        context.raw === 1 ? 'Positive' :
                        context.raw === 0 ? 'Neutral' : 'Negative'
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerAIInsights; 