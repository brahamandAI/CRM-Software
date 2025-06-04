const Customer = require('../models/Customer');
const Task = require('../models/Task');
const Interaction = require('../models/Interaction');
const User = require('../models/User');

class AutomationService {
  // Automatically update customer status based on interaction patterns
  static async updateCustomerStatuses() {
    try {
      const customers = await Customer.find({ status: { $in: ['lead', 'customer'] } });
      
      for (const customer of customers) {
        // Get last interaction
        const lastInteraction = await Interaction.findOne({ customer: customer._id })
          .sort({ date: -1 });
          
        const now = new Date();
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
        
        // If no interaction in last 30 days for active customers, mark as inactive
        if (customer.status === 'customer' && 
            (!lastInteraction || lastInteraction.date < thirtyDaysAgo)) {
          customer.status = 'inactive';
          customer.statusHistory.push({
            status: 'inactive',
            date: new Date(),
            notes: 'Automatically marked inactive due to no interaction in 30 days'
          });
          await customer.save();
        }
        
        // If lead has positive interactions, convert to customer
        if (customer.status === 'lead') {
          const positiveInteractions = await Interaction.countDocuments({
            customer: customer._id,
            outcome: 'positive'
          });
          
          if (positiveInteractions >= 2) {
            customer.status = 'customer';
            customer.statusHistory.push({
              status: 'customer',
              date: new Date(),
              notes: 'Automatically converted to customer due to positive interactions'
            });
            await customer.save();
          }
        }
      }
    } catch (error) {
      console.error('Error in updateCustomerStatuses:', error);
    }
  }

  // Automatically assign tasks based on workload and specialization
  static async autoAssignTasks() {
    try {
      // Get unassigned tasks
      const unassignedTasks = await Task.find({ assignedTo: null });
      
      if (unassignedTasks.length === 0) return;

      // Get active agents
      const agents = await User.find({ 
        role: 'agent',
        active: true
      });

      if (agents.length === 0) return;

      // Get current workload for each agent
      const workloads = await Promise.all(agents.map(async (agent) => {
        const activeTaskCount = await Task.countDocuments({
          assignedTo: agent._id,
          status: { $in: ['pending', 'in-progress'] }
        });
        return {
          agent,
          activeTaskCount
        };
      }));

      // Sort agents by workload (ascending)
      workloads.sort((a, b) => a.activeTaskCount - b.activeTaskCount);

      // Assign tasks to agents with least workload
      for (const task of unassignedTasks) {
        const leastLoadedAgent = workloads[0].agent;
        task.assignedTo = leastLoadedAgent._id;
        await task.save();
        
        // Update workload count
        workloads[0].activeTaskCount++;
        workloads.sort((a, b) => a.activeTaskCount - b.activeTaskCount);
      }
    } catch (error) {
      console.error('Error in autoAssignTasks:', error);
    }
  }

  // Clean up and maintain data quality
  static async performDataMaintenance() {
    try {
      const now = new Date();
      const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));

      // Archive completed tasks older than 6 months
      await Task.updateMany(
        {
          status: 'completed',
          completedAt: { $lt: sixMonthsAgo }
        },
        {
          $set: { archived: true }
        }
      );

      // Remove duplicate tags from customers
      const customers = await Customer.find({ tags: { $exists: true, $ne: [] } });
      for (const customer of customers) {
        const uniqueTags = [...new Set(customer.tags)];
        if (uniqueTags.length !== customer.tags.length) {
          customer.tags = uniqueTags;
          await customer.save();
        }
      }
    } catch (error) {
      console.error('Error in performDataMaintenance:', error);
    }
  }

  // Schedule all automation tasks
  static scheduleAutomation() {
    // Run customer status updates daily
    setInterval(this.updateCustomerStatuses, 24 * 60 * 60 * 1000);
    
    // Run task assignment every 4 hours
    setInterval(this.autoAssignTasks, 4 * 60 * 60 * 1000);
    
    // Run data maintenance weekly
    setInterval(this.performDataMaintenance, 7 * 24 * 60 * 60 * 1000);
  }
}

module.exports = AutomationService; 