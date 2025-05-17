const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const Customer = require('../models/Customer');
const { protect, authorize } = require('../middleware/auth');
const PDFDocument = require('pdfkit');

// @route   GET /api/customers
// @desc    Get all customers with filtering, pagination and sorting
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { 
      status, 
      search, 
      sort = 'createdAt', 
      order = 'desc', 
      page = 1, 
      limit = 10,
      assignedTo,
      company,
      tags,
      dateFrom,
      dateTo
    } = req.query;

    // Build query
    const query = {};

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Filter by company if provided
    if (company) {
      query.company = { $regex: company, $options: 'i' };
    }

    // Filter by tags if provided
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Filter by date range if provided
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo);
      }
    }

    // Filter by assigned user
    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    // If user is not admin or manager, only show their assigned customers
    if (req.user.role === 'agent') {
      query.assignedTo = req.user.id;
    }

    // Advanced search functionality
    if (search) {
      // Check if it's a simple text search or advanced regex
      if (search.includes(':')) {
        // Advanced search with field specifiers (e.g., "email:example.com,name:john")
        const searchParams = search.split(',');
        const searchConditions = [];
        
        searchParams.forEach(param => {
          const [field, value] = param.split(':');
          if (field && value) {
            const condition = {};
            condition[field.trim()] = { $regex: value.trim(), $options: 'i' };
            searchConditions.push(condition);
          }
        });
        
        if (searchConditions.length > 0) {
          query.$and = query.$and || [];
          query.$and.push({ $or: searchConditions });
        }
      } else {
        // Simple text search across multiple fields
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { notes: { $regex: search, $options: 'i' } }
        ];
      }
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sortOptions = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;

    // Execute query
    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name');

    res.json({
      success: true,
      count: customers.length,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum)
      },
      data: customers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/customers/:id
// @desc    Get customer by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name');

    if (!customer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Customer not found' 
      });
    }

    // Check if user has access to this customer
    if (req.user.role === 'agent' && 
        customer.assignedTo && 
        customer.assignedTo._id.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to access this customer' 
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Customer not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   POST /api/customers
// @desc    Create a new customer
// @access  Private
router.post('/', [
  protect,
  body('name', 'Name is required').notEmpty().trim(),
  body('email', 'Please include a valid email').isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('company').optional().trim(),
  body('status').optional().isIn(['lead', 'customer', 'inactive']),
  body('notes').optional().trim(),
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
    const status = req.body.status || 'lead';
    
    // Create new customer
    const newCustomer = new Customer({
      ...req.body,
      createdBy: req.user.id,
      // If assignedTo not provided, assign to current user
      assignedTo: req.body.assignedTo || req.user.id,
      // Add initial status to history
      statusHistory: [{
        status: status,
        date: new Date(),
        updatedBy: req.user.id,
        notes: 'Initial status'
      }]
    });

    const customer = await newCustomer.save();

    res.status(201).json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   PUT /api/customers/:id
// @desc    Update customer
// @access  Private
router.put('/:id', [
  protect,
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please include a valid email').normalizeEmail(),
  body('status').optional().isIn(['lead', 'customer', 'inactive']).withMessage('Invalid status'),
  body('assignedTo').optional().isMongoId().withMessage('Invalid user ID')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  try {
    // Check if customer exists
    let customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Customer not found' 
      });
    }

    // Check authorization
    // Agents can only update customers assigned to them
    if (req.user.role === 'agent' && 
        customer.assignedTo && 
        customer.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this customer' 
      });
    }

    // Check if status is being updated
    if (req.body.status && req.body.status !== customer.status) {
      // Add status change to history
      if (!customer.statusHistory) {
        customer.statusHistory = [];
      }
      
      customer.statusHistory.push({
        status: req.body.status,
        date: new Date(),
        updatedBy: req.user.id,
        notes: req.body.statusNotes || `Status changed from ${customer.status} to ${req.body.status}`
      });
      
      // If customer became a lead or customer, update lastContact
      if (['lead', 'customer'].includes(req.body.status)) {
        req.body.lastContact = new Date();
      }
    }

    // Update customer
    const updateData = { ...req.body };
    if (customer.statusHistory && customer.statusHistory.length > 0) {
      updateData.statusHistory = customer.statusHistory;
    }
    
    customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).populate('assignedTo', 'name email');

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Customer not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   DELETE /api/customers/:id
// @desc    Delete customer
// @access  Private (Admin and Manager only)
router.delete('/:id', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Customer not found' 
      });
    }

    await customer.remove();
    
    res.json({
      success: true,
      message: 'Customer deleted'
    });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Customer not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/customers/export/pdf
// @desc    Export customers to PDF
// @access  Private
router.get('/export/pdf', protect, async (req, res) => {
  try {
    const { 
      status, 
      search,
      company,
      assignedTo,
      customerId
    } = req.query;

    // Build query
    const query = {};

    // If a specific customer ID is provided, get only that customer
    if (customerId) {
      query._id = customerId;
    } else {
      // Filter by status if provided
      if (status) {
        query.status = status;
      }

      // Filter by company if provided
      if (company) {
        query.company = { $regex: company, $options: 'i' };
      }

      // Filter by assigned user if provided
      if (assignedTo) {
        query.assignedTo = assignedTo;
      } else if (req.user.role === 'agent') {
        // If user is agent, only show their assigned customers
        query.assignedTo = req.user.id;
      }

      // Search text if provided
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { notes: { $regex: search, $options: 'i' } }
        ];
      }
    }

    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name');

    if (customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No customers found matching the criteria'
      });
    }

    // Create a PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=customers_${Date.now()}.pdf`);
    
    // Pipe the PDF output to the response
    doc.pipe(res);
    
    // Add content to the PDF
    doc
      .fontSize(20)
      .text('Customer Report', { align: 'center' })
      .moveDown(0.5);
    
    // Add generated date
    doc
      .fontSize(10)
      .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' })
      .moveDown(1.5);
    
    // Single customer detail export
    if (customerId && customers.length === 1) {
      const customer = customers[0];
      
      // Customer header with name
      doc
        .fontSize(16)
        .fillColor('#333')
        .text(customer.name, { underline: true })
        .moveDown(0.5);
      
      // Customer meta information
      const formatDate = (date) => {
        return date ? new Date(date).toLocaleString() : 'Not set';
      };
      
      doc.fontSize(12);
      
      // Details
      const details = [
        ['Email', customer.email],
        ['Phone', customer.phone || 'Not provided'],
        ['Company', customer.company || 'Not provided'],
        ['Status', customer.status.charAt(0).toUpperCase() + customer.status.slice(1)],
        ['Assigned To', customer.assignedTo ? customer.assignedTo.name : 'Unassigned'],
        ['Created By', customer.createdBy ? customer.createdBy.name : 'Unknown'],
        ['Created On', formatDate(customer.createdAt)],
        ['Last Contact', formatDate(customer.lastContact)]
      ];
      
      // Draw details in two column layout
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
      
      // Add address if available
      if (customer.address && (customer.address.street || customer.address.city)) {
        doc
          .moveDown(1)
          .fontSize(14)
          .fillColor('#333')
          .text('Address', { underline: true })
          .moveDown(0.5);
          
        const address = [
          customer.address.street,
          customer.address.city,
          customer.address.state,
          customer.address.zipCode,
          customer.address.country
        ].filter(Boolean).join(', ');
        
        doc
          .fontSize(12)
          .fillColor('#000')
          .text(address);
      }
      
      // Add notes if available
      if (customer.notes) {
        doc
          .moveDown(1)
          .fontSize(14)
          .fillColor('#333')
          .text('Notes', { underline: true })
          .moveDown(0.5)
          .fontSize(12)
          .fillColor('#000')
          .text(customer.notes);
      }
      
      // Add tags if available
      if (customer.tags && customer.tags.length > 0) {
        doc
          .moveDown(1)
          .fontSize(14)
          .fillColor('#333')
          .text('Tags', { underline: true })
          .moveDown(0.5)
          .fontSize(12)
          .fillColor('#000')
          .text(customer.tags.join(', '));
      }
      
      // Status history if available
      if (customer.statusHistory && customer.statusHistory.length > 0) {
        doc
          .moveDown(1)
          .fontSize(14)
          .fillColor('#333')
          .text('Status History', { underline: true })
          .moveDown(0.5);
          
        doc.fontSize(10);
        customer.statusHistory.forEach((history, index) => {
          doc
            .fillColor('#000')
            .text(`${formatDate(history.date)}: Changed to ${history.status}`, { 
              continued: true 
            })
            .fillColor('#555')
            .text(history.notes ? ` - ${history.notes}` : '');
            
          if (index < customer.statusHistory.length - 1) {
            doc.moveDown(0.5);
          }
        });
      }
    } 
    // Multiple customers list export
    else {
      // Add table header
      const tableTop = 150;
      
      doc
        .fontSize(12)
        .font('Helvetica-Bold');
      
      // Draw table header
      doc.text('Name', 50, tableTop, { width: 120 })
        .text('Email', 170, tableTop, { width: 120 })
        .text('Phone', 290, tableTop, { width: 80 })
        .text('Company', 370, tableTop, { width: 80 })
        .text('Status', 450, tableTop, { width: 70 });
        
      // Draw header line
      doc
        .moveTo(50, tableTop + 20)
        .lineTo(520, tableTop + 20)
        .stroke();
      
      doc.font('Helvetica');
      
      // Draw customers as table rows
      let position = 0;
      customers.forEach((customer, i) => {
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
            .text('Name', 50, newY - 30, { width: 120 })
            .text('Email', 170, newY - 30, { width: 120 })
            .text('Phone', 290, newY - 30, { width: 80 })
            .text('Company', 370, newY - 30, { width: 80 })
            .text('Status', 450, newY - 30, { width: 70 });
            
          // Draw header line
          doc
            .moveTo(50, newY - 10)
            .lineTo(520, newY - 10)
            .stroke();
            
          doc.font('Helvetica');
        }
        
        const rowY = position === 0 && y > tableTop + 30 ? tableTop - 100 + 30 : y;
        
        // Draw customer row
        doc
          .fontSize(10)
          .text(customer.name, 50, rowY, { width: 120, ellipsis: true })
          .text(customer.email, 170, rowY, { width: 120, ellipsis: true })
          .text(customer.phone || '-', 290, rowY, { width: 80, ellipsis: true })
          .text(customer.company || '-', 370, rowY, { width: 80, ellipsis: true })
          .text(customer.status.charAt(0).toUpperCase() + customer.status.slice(1), 450, rowY, { width: 70 });
        
        // Draw row line
        doc
          .moveTo(50, rowY + 20)
          .lineTo(520, rowY + 20)
          .stroke('#ddd');
        
        position++;
      });
      
      // Add summary at the bottom
      doc
        .moveDown(3)
        .fontSize(12)
        .text(`Total customers: ${customers.length}`, { align: 'right' });
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