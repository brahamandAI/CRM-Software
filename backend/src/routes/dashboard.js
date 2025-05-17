const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Interaction = require('../models/Interaction');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    let customerQuery = {};
    let interactionQuery = {};
    let taskQuery = {};

    // If user is agent, only show their data
    if (req.user.role === 'agent') {
      customerQuery.assignedTo = req.user.id;
      
      // Get customer IDs assigned to this agent
      const assignedCustomers = await Customer.find({ assignedTo: req.user.id }).select('_id');
      const customerIds = assignedCustomers.map(customer => customer._id);
      
      interactionQuery.customer = { $in: customerIds };
      taskQuery.assignedTo = req.user.id;
    }

    // Get counts by status
    const leadCount = await Customer.countDocuments({ ...customerQuery, status: 'lead' });
    const customerCount = await Customer.countDocuments({ ...customerQuery, status: 'customer' });
    const inactiveCount = await Customer.countDocuments({ ...customerQuery, status: 'inactive' });

    // Tasks counts by status
    const pendingTasks = await Task.countDocuments({ ...taskQuery, status: 'pending' });
    const inProgressTasks = await Task.countDocuments({ ...taskQuery, status: 'in-progress' });
    const completedTasks = await Task.countDocuments({ ...taskQuery, status: 'completed' });

    // Interactions count by type
    const emailInteractions = await Interaction.countDocuments({ ...interactionQuery, type: 'email' });
    const callInteractions = await Interaction.countDocuments({ ...interactionQuery, type: 'call' });
    const meetingInteractions = await Interaction.countDocuments({ ...interactionQuery, type: 'meeting' });

    // Recent customers
    const recentCustomers = await Customer.find(customerQuery)
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email company status createdAt')
      .populate('assignedTo', 'name');

    // Recent interactions
    const recentInteractions = await Interaction.find(interactionQuery)
      .sort({ date: -1 })
      .limit(5)
      .populate('customer', 'name company')
      .populate('createdBy', 'name');

    // Upcoming tasks
    const upcomingTasks = await Task.find({ 
      ...taskQuery, 
      status: { $ne: 'completed' }, 
      dueDate: { $gte: new Date() }
    })
      .sort({ dueDate: 1 })
      .limit(5)
      .populate('customer', 'name')
      .populate('assignedTo', 'name');

    // Overdue tasks
    const overdueTasks = await Task.find({ 
      ...taskQuery, 
      status: { $ne: 'completed' }, 
      dueDate: { $lt: new Date() }
    })
      .sort({ dueDate: 1 })
      .limit(5)
      .populate('customer', 'name')
      .populate('assignedTo', 'name');

    res.json({
      success: true,
      data: {
        counts: {
          customers: {
            total: leadCount + customerCount + inactiveCount,
            lead: leadCount,
            customer: customerCount,
            inactive: inactiveCount
          },
          tasks: {
            total: pendingTasks + inProgressTasks + completedTasks,
            pending: pendingTasks,
            inProgress: inProgressTasks,
            completed: completedTasks
          },
          interactions: {
            total: emailInteractions + callInteractions + meetingInteractions,
            email: emailInteractions,
            call: callInteractions,
            meeting: meetingInteractions
          }
        },
        recent: {
          customers: recentCustomers,
          interactions: recentInteractions,
          upcomingTasks,
          overdueTasks
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/dashboard/activity
// @desc    Get recent activity for dashboard
// @access  Private
router.get('/activity', protect, async (req, res) => {
  try {
    let customerQuery = {};
    let interactionQuery = {};
    let taskQuery = {};

    // If user is agent, only show their data
    if (req.user.role === 'agent') {
      customerQuery.assignedTo = req.user.id;
      
      // Get customer IDs assigned to this agent
      const assignedCustomers = await Customer.find({ assignedTo: req.user.id }).select('_id');
      const customerIds = assignedCustomers.map(customer => customer._id);
      
      interactionQuery.customer = { $in: customerIds };
      taskQuery.assignedTo = req.user.id;
    }

    // Get recent customers
    const recentCustomers = await Customer.find(customerQuery)
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email company status createdAt')
      .populate('assignedTo', 'name')
      .populate('createdBy', 'name');

    // Recent interactions
    const recentInteractions = await Interaction.find(interactionQuery)
      .sort({ date: -1 })
      .limit(10)
      .populate('customer', 'name company')
      .populate('createdBy', 'name');

    // Recent tasks
    const recentTasks = await Task.find(taskQuery)
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('customer', 'name')
      .populate('assignedTo', 'name')
      .populate('createdBy', 'name');

    // Combine and sort by date
    const allActivity = [
      ...recentCustomers.map(item => ({
        type: 'customer',
        action: 'created',
        date: item.createdAt,
        data: item
      })),
      ...recentInteractions.map(item => ({
        type: 'interaction',
        action: 'logged',
        date: item.date,
        data: item
      })),
      ...recentTasks.map(item => ({
        type: 'task',
        action: item.status === 'completed' ? 'completed' : 'created',
        date: item.status === 'completed' ? item.completedAt : item.createdAt,
        data: item
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20);

    res.json({
      success: true,
      data: allActivity
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/dashboard/charts
// @desc    Get chart data for dashboard
// @access  Private
router.get('/charts', protect, async (req, res) => {
  try {
    let customerQuery = {};
    let interactionQuery = {};
    
    // If user is agent, only show their data
    if (req.user.role === 'agent') {
      customerQuery.assignedTo = req.user.id;
      
      // Get customer IDs assigned to this agent
      const assignedCustomers = await Customer.find({ assignedTo: req.user.id }).select('_id');
      const customerIds = assignedCustomers.map(customer => customer._id);
      
      interactionQuery.customer = { $in: customerIds };
    }

    // Customer status distribution
    const customerStatusData = [
      { status: 'lead', count: await Customer.countDocuments({ ...customerQuery, status: 'lead' }) },
      { status: 'customer', count: await Customer.countDocuments({ ...customerQuery, status: 'customer' }) },
      { status: 'inactive', count: await Customer.countDocuments({ ...customerQuery, status: 'inactive' }) }
    ];

    // Interaction types distribution
    const interactionTypeData = [
      { type: 'email', count: await Interaction.countDocuments({ ...interactionQuery, type: 'email' }) },
      { type: 'call', count: await Interaction.countDocuments({ ...interactionQuery, type: 'call' }) },
      { type: 'meeting', count: await Interaction.countDocuments({ ...interactionQuery, type: 'meeting' }) },
      { type: 'note', count: await Interaction.countDocuments({ ...interactionQuery, type: 'note' }) },
      { type: 'other', count: await Interaction.countDocuments({ ...interactionQuery, type: 'other' }) }
    ];

    // Monthly interactions (last 6 months)
    const monthlyInteractions = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const nextMonth = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);
      
      const count = await Interaction.countDocuments({
        ...interactionQuery,
        date: { $gte: month, $lt: nextMonth }
      });
      
      monthlyInteractions.push({
        month: month.toLocaleString('default', { month: 'short', year: 'numeric' }),
        count
      });
    }

    // Lead status distribution
    const leadDistribution = await Customer.aggregate([
      { $match: { ...customerQuery, status: 'lead' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } },
      { $limit: 6 }
    ]);

    res.json({
      success: true,
      data: {
        customerStatus: customerStatusData,
        interactionTypes: interactionTypeData,
        monthlyInteractions,
        leadDistribution: leadDistribution.map(item => ({
          month: new Date(item._id + '-01').toLocaleString('default', { month: 'short', year: 'numeric' }),
          count: item.count
        }))
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/dashboard/conversion-stats
// @desc    Get conversion statistics
// @access  Private
router.get('/conversion-stats', protect, async (req, res) => {
  try {
    let customerQuery = {};
    
    // If user is agent, only show their data
    if (req.user.role === 'agent') {
      customerQuery.assignedTo = req.user.id;
    }

    // Count total leads and customers for conversion rate
    const totalLeads = await Customer.countDocuments({ ...customerQuery, status: 'lead' });
    const totalCustomers = await Customer.countDocuments({ ...customerQuery, status: 'customer' });
    
    // Calculate conversion rate
    const conversionRate = totalLeads > 0 ? (totalCustomers / (totalLeads + totalCustomers) * 100).toFixed(2) : 0;
    
    // Get average time to convert from lead to customer (in days)
    const convertedCustomers = await Customer.find({
      ...customerQuery,
      status: 'customer',
      statusHistory: { 
        $elemMatch: { 
          status: 'lead',
          date: { $exists: true } 
        } 
      }
    }).select('statusHistory createdAt');
    
    let totalDays = 0;
    let countWithHistory = 0;
    
    convertedCustomers.forEach(customer => {
      if (customer.statusHistory && customer.statusHistory.length > 1) {
        // Find the most recent lead status and customer status entries
        const leadEntry = customer.statusHistory
          .filter(h => h.status === 'lead')
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
          
        const customerEntry = customer.statusHistory
          .filter(h => h.status === 'customer')
          .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
        
        if (leadEntry && customerEntry) {
          const leadDate = new Date(leadEntry.date);
          const customerDate = new Date(customerEntry.date);
          
          if (customerDate > leadDate) {
            const days = Math.round((customerDate - leadDate) / (1000 * 60 * 60 * 24));
            totalDays += days;
            countWithHistory++;
          }
        }
      }
    });
    
    const avgDaysToConvert = countWithHistory > 0 ? Math.round(totalDays / countWithHistory) : 0;
    
    // Get monthly conversion rates for the last 6 months
    const monthlyConversions = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const nextMonth = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);
      
      // For this month count leads that became customers
      const newCustomers = await Customer.countDocuments({
        ...customerQuery,
        status: 'customer',
        statusHistory: {
          $elemMatch: {
            status: 'customer',
            date: { $gte: month, $lt: nextMonth }
          }
        }
      });
      
      // Count all leads in this month
      const newLeads = await Customer.countDocuments({
        ...customerQuery,
        createdAt: { $gte: month, $lt: nextMonth },
        status: 'lead'
      });
      
      // Monthly conversion rate
      const monthlyRate = newLeads > 0 ? (newCustomers / (newLeads + newCustomers) * 100).toFixed(2) : 0;
      
      monthlyConversions.push({
        month: month.toLocaleString('default', { month: 'short', year: 'numeric' }),
        rate: parseFloat(monthlyRate),
        leads: newLeads,
        conversions: newCustomers
      });
    }
    
    res.json({
      success: true,
      data: {
        conversionRate: parseFloat(conversionRate),
        avgDaysToConvert,
        monthlyConversions,
        totalLeads,
        totalCustomers
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/dashboard/export/customers
// @desc    Export customer data in CSV format
// @access  Private
router.get('/export/customers', protect, async (req, res) => {
  try {
    let query = {};

    // If user is agent, only show their data
    if (req.user.role === 'agent') {
      query.assignedTo = req.user.id;
    }

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    const customers = await Customer.find(query)
      .populate('assignedTo', 'name email')
      .lean();

    // Format data for CSV
    let csvContent = 'Name,Email,Phone,Company,Status,Notes,Assigned To\n';
    
    customers.forEach(customer => {
      const assignedToName = customer.assignedTo ? customer.assignedTo.name : 'Unassigned';
      // Escape fields that might contain commas
      const row = [
        `"${customer.name || ''}"`,
        `"${customer.email || ''}"`,
        `"${customer.phone || ''}"`,
        `"${customer.company || ''}"`,
        `"${customer.status || ''}"`,
        `"${(customer.notes || '').replace(/"/g, '""')}"`,
        `"${assignedToName}"`
      ].join(',');
      
      csvContent += row + '\n';
    });

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename=customers.csv');
    res.send(csvContent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/dashboard/export/interactions
// @desc    Export interaction data in CSV format
// @access  Private
router.get('/export/interactions', protect, async (req, res) => {
  try {
    let query = {};
    
    // If user is agent, only show interactions for their customers
    if (req.user.role === 'agent') {
      const assignedCustomers = await Customer.find({ assignedTo: req.user.id }).select('_id');
      const customerIds = assignedCustomers.map(customer => customer._id);
      query.customer = { $in: customerIds };
    }

    // Filter by customer if provided
    if (req.query.customerId) {
      query.customer = req.query.customerId;
    }
    
    // Filter by type if provided
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    // Filter by date range if provided
    if (req.query.startDate || req.query.endDate) {
      query.date = {};
      if (req.query.startDate) query.date.$gte = new Date(req.query.startDate);
      if (req.query.endDate) query.date.$lte = new Date(req.query.endDate);
    }

    const interactions = await Interaction.find(query)
      .populate('customer', 'name email company')
      .populate('createdBy', 'name email')
      .lean();

    // Format data for CSV
    let csvContent = 'Date,Customer,Type,Summary,Outcome,Created By\n';
    
    interactions.forEach(interaction => {
      const customerName = interaction.customer ? interaction.customer.name : 'Unknown';
      const createdByName = interaction.createdBy ? interaction.createdBy.name : 'Unknown';
      
      // Format date
      const date = new Date(interaction.date).toLocaleDateString();
      
      // Escape fields that might contain commas
      const row = [
        `"${date}"`,
        `"${customerName}"`,
        `"${interaction.type || ''}"`,
        `"${(interaction.summary || '').replace(/"/g, '""')}"`,
        `"${interaction.outcome || ''}"`,
        `"${createdByName}"`
      ].join(',');
      
      csvContent += row + '\n';
    });

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename=interactions.csv');
    res.send(csvContent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router; 