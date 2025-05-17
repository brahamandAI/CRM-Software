const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Interaction = require('../models/Interaction');
const Customer = require('../models/Customer');
const { protect, authorize } = require('../middleware/auth');
const PDFDocument = require('pdfkit');

// @route   GET /api/interactions
// @desc    Get all interactions with filtering
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { 
      customerId, 
      type, 
      outcome,
      startDate, 
      endDate,
      sort = 'date', 
      order = 'desc'
    } = req.query;

    // Build query
    const query = {};

    // Filter by customer if customerId is provided
    if (customerId) {
      query.customer = customerId;
    }

    // Filter by type if provided
    if (type) {
      query.type = type;
    }

    // Filter by outcome if provided
    if (outcome) {
      query.outcome = outcome;
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // If user is agent, only show interactions for customers assigned to them
    if (req.user.role === 'agent') {
      const assignedCustomers = await Customer.find({ assignedTo: req.user.id }).select('_id');
      const customerIds = assignedCustomers.map(customer => customer._id);
      query.customer = { $in: customerIds };
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;

    // Execute query
    const interactions = await Interaction.find(query)
      .sort(sortOptions)
      .populate('customer', 'name email company')
      .populate('createdBy', 'name');

    res.json({
      success: true,
      count: interactions.length,
      data: interactions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/interactions/:id
// @desc    Get interaction by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const interaction = await Interaction.findById(req.params.id)
      .populate('customer', 'name email company')
      .populate('createdBy', 'name');

    if (!interaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Interaction not found' 
      });
    }

    // Check authorization for agents
    if (req.user.role === 'agent') {
      const customer = await Customer.findById(interaction.customer._id);
      if (!customer || (customer.assignedTo && customer.assignedTo.toString() !== req.user.id)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Not authorized to access this interaction' 
        });
      }
    }

    res.json({
      success: true,
      data: interaction
    });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Interaction not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   POST /api/interactions
// @desc    Create a new interaction
// @access  Private
router.post('/', [
  protect,
  body('customer', 'Customer ID is required').isMongoId(),
  body('type', 'Type is required').isIn(['email', 'call', 'meeting', 'note', 'other']),
  body('summary', 'Summary is required').notEmpty().trim(),
  body('date').optional().isISO8601().toDate(),
  body('outcome').optional().isIn(['positive', 'negative', 'neutral', 'pending'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  try {
    // Check if customer exists and user has access
    const customer = await Customer.findById(req.body.customer);
    
    if (!customer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Customer not found' 
      });
    }

    // Agents can only add interactions for their assigned customers
    if (req.user.role === 'agent' && 
        customer.assignedTo && 
        customer.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to add interaction for this customer' 
      });
    }

    // Create new interaction
    const newInteraction = new Interaction({
      ...req.body,
      createdBy: req.user.id,
      date: req.body.date || Date.now()
    });

    const interaction = await newInteraction.save();

    // Update customer's lastContact field
    await Customer.findByIdAndUpdate(customer._id, {
      lastContact: interaction.date
    });

    // Populate customer and createdBy fields for response
    await interaction.populate('customer', 'name email company');
    await interaction.populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      data: interaction
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   PUT /api/interactions/:id
// @desc    Update interaction
// @access  Private
router.put('/:id', [
  protect,
  body('type').optional().isIn(['email', 'call', 'meeting', 'note', 'other']),
  body('summary').optional().notEmpty().trim(),
  body('date').optional().isISO8601().toDate(),
  body('outcome').optional().isIn(['positive', 'negative', 'neutral', 'pending'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  try {
    // Check if interaction exists
    let interaction = await Interaction.findById(req.params.id);
    
    if (!interaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Interaction not found' 
      });
    }

    // Check authorization
    if (req.user.role === 'agent') {
      // Agents can only edit interactions they created or for customers assigned to them
      if (interaction.createdBy.toString() !== req.user.id) {
        const customer = await Customer.findById(interaction.customer);
        if (!customer || (customer.assignedTo && customer.assignedTo.toString() !== req.user.id)) {
          return res.status(403).json({ 
            success: false, 
            message: 'Not authorized to update this interaction' 
          });
        }
      }
    }

    // Update interaction
    interaction = await Interaction.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    )
      .populate('customer', 'name email company')
      .populate('createdBy', 'name');

    res.json({
      success: true,
      data: interaction
    });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Interaction not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   DELETE /api/interactions/:id
// @desc    Delete interaction
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const interaction = await Interaction.findById(req.params.id);
    
    if (!interaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Interaction not found' 
      });
    }

    // Check authorization
    if (req.user.role === 'agent') {
      // Agents can only delete interactions they created
      if (interaction.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          message: 'Not authorized to delete this interaction' 
        });
      }
    }

    await interaction.remove();
    
    res.json({
      success: true,
      message: 'Interaction deleted'
    });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Interaction not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/interactions/export/pdf
// @desc    Export interactions to PDF
// @access  Private
router.get('/export/pdf', protect, async (req, res) => {
  try {
    const { 
      type, 
      customerId,
      interactionId,
      startDate,
      endDate
    } = req.query;

    // Build query
    const query = {};

    // If a specific interaction ID is provided, get only that interaction
    if (interactionId) {
      query._id = interactionId;
    } else {
      // Filter by type if provided
      if (type) {
        query.type = type;
      }

      // Filter by customer if provided
      if (customerId) {
        query.customer = customerId;
      } else if (req.user.role === 'agent') {
        // If user is agent, only show interactions for their customers
        const assignedCustomers = await Customer.find({ assignedTo: req.user.id }).select('_id');
        const customerIds = assignedCustomers.map(customer => customer._id);
        query.customer = { $in: customerIds };
      }

      // Filter by date range if provided
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }
    }

    const interactions = await Interaction.find(query)
      .sort({ date: -1 })
      .populate('customer', 'name email company')
      .populate('createdBy', 'name');

    if (interactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No interactions found matching the criteria'
      });
    }

    // Create a PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=interactions_${Date.now()}.pdf`);
    
    // Pipe the PDF output to the response
    doc.pipe(res);
    
    // Add content to the PDF
    doc
      .fontSize(20)
      .text('Interaction Report', { align: 'center' })
      .moveDown(0.5);
    
    // Add generated date
    doc
      .fontSize(10)
      .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' })
      .moveDown(1.5);
    
    // Single interaction detail export
    if (interactionId && interactions.length === 1) {
      const interaction = interactions[0];
      
      // Interaction header with type and date
      const formatDate = (date) => {
        return date ? new Date(date).toLocaleString() : 'Not set';
      };
      
      doc
        .fontSize(16)
        .fillColor('#333')
        .text(`${interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1)} - ${formatDate(interaction.date)}`, { underline: true })
        .moveDown(0.5);
      
      // Customer info
      if (interaction.customer) {
        doc
          .fontSize(14)
          .fillColor('#444')
          .text(`Customer: ${interaction.customer.name}`, { continued: interaction.customer.company ? true : false });
          
        if (interaction.customer.company) {
          doc.text(` (${interaction.customer.company})`);
        } else {
          doc.moveDown(0.5);
        }
      }
      
      // Main content
      doc.fontSize(12);
      
      // Summary
      if (interaction.summary) {
        doc
          .moveDown(1)
          .fillColor('#333')
          .text('Summary:', { continued: false })
          .moveDown(0.5)
          .fillColor('#000')
          .text(interaction.summary)
          .moveDown(1);
      }
      
      // Details
      const details = [
        ['Type', interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1)],
        ['Date', formatDate(interaction.date)],
        ['Created By', interaction.createdBy ? interaction.createdBy.name : 'Unknown'],
        ['Created At', formatDate(interaction.createdAt)]
      ];
      
      if (interaction.outcome) {
        details.push(['Outcome', interaction.outcome]);
      }
      
      // Draw details
      doc
        .moveDown(1)
        .fillColor('#333')
        .text('Details:', { continued: false })
        .moveDown(0.5);
        
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
      
      // Notes
      if (interaction.notes) {
        doc
          .moveDown(2)
          .fillColor('#333')
          .text('Notes:', { continued: false })
          .moveDown(0.5)
          .fillColor('#000')
          .text(interaction.notes)
          .moveDown(1);
      }
    } 
    // Multiple interactions list export
    else {
      // Add table header
      const tableTop = 150;
      
      doc
        .fontSize(12)
        .font('Helvetica-Bold');
      
      // Draw table header
      doc.text('Date', 50, tableTop, { width: 80 })
        .text('Customer', 130, tableTop, { width: 120 })
        .text('Type', 250, tableTop, { width: 80 })
        .text('Summary', 330, tableTop, { width: 170 });
        
      // Draw header line
      doc
        .moveTo(50, tableTop + 20)
        .lineTo(500, tableTop + 20)
        .stroke();
      
      doc.font('Helvetica');
      
      // Format date for display
      const formatDate = (date) => {
        return date ? new Date(date).toLocaleDateString() : 'N/A';
      };
      
      // Draw interactions as table rows
      let position = 0;
      interactions.forEach((interaction, i) => {
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
            .text('Date', 50, newY - 30, { width: 80 })
            .text('Customer', 130, newY - 30, { width: 120 })
            .text('Type', 250, newY - 30, { width: 80 })
            .text('Summary', 330, newY - 30, { width: 170 });
            
          // Draw header line
          doc
            .moveTo(50, newY - 10)
            .lineTo(500, newY - 10)
            .stroke();
            
          doc.font('Helvetica');
        }
        
        const rowY = position === 0 && y > tableTop + 30 ? tableTop - 100 + 30 : y;
        
        // Draw interaction row
        doc
          .fontSize(10)
          .text(formatDate(interaction.date), 50, rowY, { width: 80 })
          .text(interaction.customer ? interaction.customer.name : 'Unknown', 130, rowY, { width: 120, ellipsis: true })
          .text(interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1), 250, rowY, { width: 80 })
          .text(interaction.summary || '-', 330, rowY, { width: 170, ellipsis: true });
        
        // Draw row line
        doc
          .moveTo(50, rowY + 20)
          .lineTo(500, rowY + 20)
          .stroke('#ddd');
        
        position++;
      });
      
      // Add summary at the bottom
      doc
        .moveDown(3)
        .fontSize(12)
        .text(`Total interactions: ${interactions.length}`, { align: 'right' });
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