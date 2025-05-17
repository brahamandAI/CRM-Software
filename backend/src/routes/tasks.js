const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Customer = require('../models/Customer');
const { protect, authorize } = require('../middleware/auth');
const PDFDocument = require('pdfkit');

// @route   GET /api/tasks
// @desc    Get all tasks with filtering
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { 
      status, 
      priority,
      customerId,
      assignedTo,
      dueDate,
      dueBefore,
      dueAfter,
      sort = 'dueDate', 
      order = 'asc',
      overdue,
      dueToday,
      dueThisWeek
    } = req.query;

    // Build query
    const query = {};

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Filter by priority if provided
    if (priority) {
      query.priority = priority;
    }

    // Filter by customer if provided
    if (customerId) {
      query.customer = customerId;
    }

    // Filter by assigned user if provided
    if (assignedTo) {
      query.assignedTo = assignedTo;
    } else if (req.user.role === 'agent') {
      // If user is agent, only show tasks assigned to them
      query.assignedTo = req.user.id;
    }

    // Filter by due date
    if (dueDate) {
      const date = new Date(dueDate);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      query.dueDate = { $gte: startOfDay, $lte: endOfDay };
    } else {
      // Special filters
      if (overdue === 'true') {
        query.dueDate = { $lt: new Date() };
        query.status = { $ne: 'completed' };
      }
      else if (dueToday === 'true') {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));
        query.dueDate = { $gte: startOfDay, $lte: endOfDay };
      }
      else if (dueThisWeek === 'true') {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfWeek = new Date(today);
        endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
        endOfWeek.setHours(23, 59, 59, 999);
        query.dueDate = { $gte: startOfDay, $lte: endOfWeek };
      }
      // Filter by due date range if provided
      else if (dueBefore || dueAfter) {
        query.dueDate = {};
        if (dueBefore) query.dueDate.$lte = new Date(dueBefore);
        if (dueAfter) query.dueDate.$gte = new Date(dueAfter);
      }
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;

    // Execute query
    const tasks = await Task.find(query)
      .sort(sortOptions)
      .populate('customer', 'name email company')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name');

    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get task by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('customer', 'name email company')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name');

    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }

    // Check if user has access to this task
    if (req.user.role === 'agent' && task.assignedTo._id.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to access this task' 
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', [
  protect,
  body('title', 'Title is required').notEmpty().trim(),
  body('dueDate', 'Due date is required').isISO8601().toDate(),
  body('assignedTo', 'Assigned user ID is required').isMongoId(),
  body('customer').optional().isMongoId(),
  body('status').optional().isIn(['pending', 'in-progress', 'completed', 'cancelled']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  try {
    // If a customer is provided, check if it exists
    if (req.body.customer) {
      const customer = await Customer.findById(req.body.customer);
      if (!customer) {
        return res.status(404).json({ 
          success: false, 
          message: 'Customer not found' 
        });
      }

      // Check if agent has access to this customer
      if (req.user.role === 'agent' && 
          customer.assignedTo && 
          customer.assignedTo.toString() !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          message: 'Not authorized to create tasks for this customer' 
        });
      }
    }

    // Agents can only assign tasks to themselves
    if (req.user.role === 'agent' && req.body.assignedTo !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Agents can only assign tasks to themselves' 
      });
    }

    // Create new task
    const newTask = new Task({
      ...req.body,
      createdBy: req.user.id
    });

    const task = await newTask.save();

    // Populate references for response
    await task.populate('customer', 'name email company');
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', [
  protect,
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('dueDate').optional().isISO8601().toDate(),
  body('status').optional().isIn(['pending', 'in-progress', 'completed', 'cancelled']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('assignedTo').optional().isMongoId()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  try {
    // Check if task exists
    let task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }

    // Implement authorization logic
    if (req.user.role === 'agent') {
      // Agents can only update tasks assigned to them
      if (task.assignedTo.toString() !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          message: 'Not authorized to update this task' 
        });
      }
      
      // Agents cannot reassign tasks
      if (req.body.assignedTo && req.body.assignedTo !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          message: 'Agents cannot reassign tasks' 
        });
      }
    }

    // Set completedAt date if status is changed to completed
    if (req.body.status === 'completed' && task.status !== 'completed') {
      req.body.completedAt = Date.now();
    } else if (req.body.status && req.body.status !== 'completed') {
      req.body.completedAt = null;
    }

    // Update task
    task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    )
      .populate('customer', 'name email company')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name');

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private (Admin, Manager, or task creator)
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }

    // Authorization check
    if (req.user.role === 'agent' && 
        task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this task' 
      });
    }

    await task.remove();
    
    res.json({
      success: true,
      message: 'Task deleted'
    });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/tasks/export/pdf
// @desc    Export tasks to PDF
// @access  Private
router.get('/export/pdf', protect, async (req, res) => {
  try {
    const { 
      status, 
      priority,
      customerId,
      assignedTo,
      taskId
    } = req.query;

    // Build query
    const query = {};

    // If a specific task ID is provided, get only that task
    if (taskId) {
      query._id = taskId;
    } else {
      // Filter by status if provided
      if (status) {
        query.status = status;
      }

      // Filter by priority if provided
      if (priority) {
        query.priority = priority;
      }

      // Filter by customer if provided
      if (customerId) {
        query.customer = customerId;
      }

      // Filter by assigned user if provided
      if (assignedTo) {
        query.assignedTo = assignedTo;
      } else if (req.user.role === 'agent') {
        // If user is agent, only show tasks assigned to them
        query.assignedTo = req.user.id;
      }
    }

    const tasks = await Task.find(query)
      .sort({ dueDate: 1 })
      .populate('customer', 'name email company')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name');

    if (tasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No tasks found matching the criteria'
      });
    }

    // Create a PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=tasks_${Date.now()}.pdf`);
    
    // Pipe the PDF output to the response
    doc.pipe(res);
    
    // Add content to the PDF
    doc
      .fontSize(20)
      .text('Tasks Report', { align: 'center' })
      .moveDown(0.5);
    
    // Add generated date
    doc
      .fontSize(10)
      .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' })
      .moveDown(1.5);
    
    // Single task detail export
    if (taskId && tasks.length === 1) {
      const task = tasks[0];
      
      // Task header with title
      doc
        .fontSize(16)
        .fillColor('#333')
        .text(task.title, { underline: true })
        .moveDown(0.5);
      
      // Task meta information
      const formatDate = (date) => {
        return date ? new Date(date).toLocaleString() : 'Not set';
      };
      
      doc.fontSize(12);
      
      // Two column layout for details
      const details = [
        ['Status', task.status.charAt(0).toUpperCase() + task.status.slice(1)],
        ['Priority', task.priority.charAt(0).toUpperCase() + task.priority.slice(1)],
        ['Due Date', formatDate(task.dueDate)],
        ['Reminder Date', formatDate(task.reminderDate)],
        ['Assigned To', task.assignedTo ? task.assignedTo.name : 'Unassigned'],
        ['Created By', task.createdBy ? task.createdBy.name : 'Unknown'],
        ['Created At', formatDate(task.createdAt)],
        ['Completed At', formatDate(task.completedAt)]
      ];
      
      // Related customer info
      if (task.customer) {
        details.push(['Customer', task.customer.name]);
        if (task.customer.company) {
          details.push(['Company', task.customer.company]);
        }
        details.push(['Email', task.customer.email]);
      }
      
      // Draw details table
      let y = doc.y;
      details.forEach((detail, i) => {
        const isLeft = i % 2 === 0;
        doc
          .fillColor('#555')
          .text(detail[0] + ':', isLeft ? 50 : 300, y, { width: 100, continued: true })
          .fillColor('#000')
          .text(detail[1], { width: 150 });
        
        if (isLeft && i < details.length - 1) {
          // Don't increment y for left column
        } else {
          y = doc.y + 10;
        }
        doc.y = y;
      });
      
      doc.moveDown(1);
      
      // Task description
      if (task.description) {
        doc
          .fontSize(12)
          .fillColor('#555')
          .text('Description:', { continued: false })
          .moveDown(0.5)
          .fillColor('#000')
          .text(task.description)
          .moveDown(2);
      }
    } 
    // Multiple tasks list export
    else {
      // Add table header
      const tableTop = 150;
      const columnSpacing = 25;
      
      doc
        .fontSize(12)
        .font('Helvetica-Bold');
      
      // Draw table header
      doc.text('Title', 50, tableTop, { width: 150 })
        .text('Status', 200, tableTop, { width: 80 })
        .text('Priority', 280, tableTop, { width: 80 })
        .text('Due Date', 360, tableTop, { width: 100 })
        .text('Assigned To', 460, tableTop, { width: 80 });
        
      // Draw header line
      doc
        .moveTo(50, tableTop + 20)
        .lineTo(550, tableTop + 20)
        .stroke();
      
      doc.font('Helvetica');
      
      // Format date for display
      const formatDate = (date) => {
        return date ? new Date(date).toLocaleDateString() : 'N/A';
      };
      
      // Draw tasks as table rows
      let position = 0;
      tasks.forEach((task, i) => {
        const y = tableTop + 30 + (position * 25);
        
        // Check if we need a new page
        if (y > 700) {
          doc.addPage();
          position = 0;
          const newY = tableTop - 100 + (position * 25);
          
          // Redraw header on new page
          doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .text('Title', 50, newY - 30, { width: 150 })
            .text('Status', 200, newY - 30, { width: 80 })
            .text('Priority', 280, newY - 30, { width: 80 })
            .text('Due Date', 360, newY - 30, { width: 100 })
            .text('Assigned To', 460, newY - 30, { width: 80 });
            
          // Draw header line
          doc
            .moveTo(50, newY - 10)
            .lineTo(550, newY - 10)
            .stroke();
            
          doc.font('Helvetica');
        }
        
        const rowY = position === 0 && y > tableTop + 30 ? tableTop - 100 + 30 : y;
        
        // Draw task row
        doc
          .fontSize(10)
          .text(task.title, 50, rowY, { width: 150, ellipsis: true })
          .text(task.status.charAt(0).toUpperCase() + task.status.slice(1), 200, rowY, { width: 80 })
          .text(task.priority.charAt(0).toUpperCase() + task.priority.slice(1), 280, rowY, { width: 80 })
          .text(formatDate(task.dueDate), 360, rowY, { width: 100 })
          .text(task.assignedTo ? task.assignedTo.name : 'Unassigned', 460, rowY, { width: 80 });
        
        // Draw row line
        doc
          .moveTo(50, rowY + 20)
          .lineTo(550, rowY + 20)
          .stroke('#ddd');
        
        position++;
      });
      
      // Add summary at the bottom
      doc
        .moveDown(3)
        .fontSize(12)
        .text(`Total tasks: ${tasks.length}`, { align: 'right' });
    }
    
    // Add footer with page numbers
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      
      // Footer
      doc
        .fontSize(8)
        .text(
          `Page ${i + 1} of ${pages.count}`,
          50,
          doc.page.height - 50,
          { align: 'center' }
        );
    }
    
    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error generating PDF' 
    });
  }
});

module.exports = router; 