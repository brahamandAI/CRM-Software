require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const AutomationService = require('./services/AutomationService');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const customerRoutes = require('./routes/customers');
const interactionRoutes = require('./routes/interactions');
const taskRoutes = require('./routes/tasks');
const dashboardRoutes = require('./routes/dashboard');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Connect to MongoDB
console.log('Attempting to connect to MongoDB...');

// Mongoose 8.x compatible options
const options = {
  serverApi: {
    version: '1', 
    strict: false,
    deprecationErrors: false
  },
  tlsAllowInvalidCertificates: true,  // This helps with SSL issues
  tlsAllowInvalidHostnames: true,     // This helps with SSL issues
  maxPoolSize: 10,                    // Keep connection pool smaller
  socketTimeoutMS: 45000,             // Close sockets after 45 seconds
  family: 4                          // Use IPv4, skip trying IPv6
};

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/brahamand-crm', options)
  .then(() => {
    console.log('MongoDB connected successfully');
    // Start automation services
    AutomationService.scheduleAutomation();
  })
  .catch(err => {
    console.error('MongoDB connection error:');
    console.error(err);
    console.error('Connection string used (without credentials):', 
      process.env.MONGODB_URI ? 
      process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : 
      'mongodb://localhost:27017/brahamand-crm'
    );
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : null
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 