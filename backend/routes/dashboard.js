const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Interaction = require('../models/Interaction');
const auth = require('../middleware/auth');

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    // Get total counts
    const totalLeads = await Customer.countDocuments({ status: 'lead' });
    const totalCustomers = await Customer.countDocuments({ status: 'customer' });
    
    // Calculate conversion rate
    const conversionRate = totalLeads > 0 
      ? Math.round((totalCustomers / (totalLeads + totalCustomers)) * 100) 
      : 0;

    // Get average days to convert
    const convertedCustomers = await Customer.find({
      status: 'customer',
      convertedAt: { $exists: true },
      createdAt: { $exists: true }
    });

    const avgDaysToConvert = convertedCustomers.length > 0
      ? Math.round(
          convertedCustomers.reduce((acc, customer) => {
            const days = Math.round((customer.convertedAt - customer.createdAt) / (1000 * 60 * 60 * 24));
            return acc + days;
          }, 0) / convertedCustomers.length
        )
      : 0;

    // Get monthly interactions data
    const monthlyInteractions = await Interaction.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 }
    ]);

    // Format monthly interactions for chart
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = {
      labels: monthlyInteractions.map(item => monthNames[item._id.month - 1]),
      datasets: [{
        label: 'Interactions',
        data: monthlyInteractions.map(item => item.count),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }]
    };

    // Get lead status distribution
    const leadStatusData = {
      labels: ['Lead', 'Customer', 'Inactive'],
      datasets: [{
        data: [totalLeads, totalCustomers, 0], // Add inactive count if available
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(156, 163, 175, 0.8)'
        ]
      }]
    };

    // Get lead conversion metrics
    const now = new Date();
    const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));
    
    const conversions = await Customer.aggregate([
      {
        $match: {
          convertedAt: { $gte: sixMonthsAgo },
          status: 'customer'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$convertedAt" },
            month: { $month: "$convertedAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const conversionData = {
      labels: conversions.map(item => monthNames[item._id.month - 1]),
      datasets: [{
        label: 'Conversions',
        data: conversions.map(item => item.count),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4
      }]
    };

    // Get recent activity
    const recentActivity = await Promise.all([
      // Get recent customers
      Customer.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .select('name createdAt status'),
      // Get recent interactions
      Interaction.find()
        .sort({ date: -1 })
        .limit(3)
        .populate('customer', 'name')
        .select('type summary date')
    ]);

    const [recentCustomers, recentInteractions] = recentActivity;
    
    const formattedActivity = [
      ...recentCustomers.map(customer => ({
        title: `New ${customer.status === 'customer' ? 'Customer' : 'Lead'} Added`,
        description: customer.name,
        time: customer.createdAt.toLocaleString()
      })),
      ...recentInteractions.map(interaction => ({
        title: `New ${interaction.type} Interaction`,
        description: `${interaction.customer.name}: ${interaction.summary}`,
        time: interaction.date.toLocaleString()
      }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

    res.json({
      totalLeads,
      totalCustomers,
      conversionRate,
      avgDaysToConvert,
      monthlyInteractions: monthlyData,
      leadStatus: leadStatusData,
      leadConversion: conversionData,
      recentActivity: formattedActivity
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 