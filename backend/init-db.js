/**
 * MongoDB Initialization Script for Brahamand CRM
 * 
 * This script creates an admin user and sample data in your MongoDB Atlas database.
 * Run with: node init-db.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');

// Create prompt interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Define the admin user
const adminUser = {
  name: 'Admin User',
  email: 'admin@brahamand-crm.com',
  password: 'admin123',
  role: 'admin',
  active: true
};

// Connect to MongoDB Atlas
async function initDatabase() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MongoDB URI not found in .env file.');
      console.log('Please run "node setup-mongodb.js" first to configure your MongoDB Atlas connection.');
      process.exit(1);
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Atlas connected successfully!');
    
    // Ask for confirmation before proceeding
    const confirm = await new Promise((resolve) => {
      rl.question('\nThis will initialize your database with an admin user and sample data. Continue? (y/n): ', (answer) => {
        resolve(answer.toLowerCase() === 'y');
      });
    });
    
    if (!confirm) {
      console.log('Database initialization canceled.');
      await mongoose.disconnect();
      rl.close();
      return;
    }
    
    // Import the User model
    const User = require('./src/models/User');
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    
    if (existingAdmin) {
      console.log('Admin user already exists in the database.');
    } else {
      // Create the admin user
      // Password will be hashed by the User model pre-save hook
      const user = new User(adminUser);
      await user.save();
      
      console.log('✅ Admin user created successfully!');
      console.log('   Email: admin@brahamand-crm.com');
      console.log('   Password: admin123');
      console.log('   IMPORTANT: Please change this password after first login!');
    }
    
    // Ask if user wants to create sample data
    const createSamples = await new Promise((resolve) => {
      rl.question('\nDo you want to create sample data (customers, interactions, tasks)? (y/n): ', (answer) => {
        resolve(answer.toLowerCase() === 'y');
      });
    });
    
    if (createSamples) {
      // Add sample data
      await createSampleData();
    } else {
      console.log('Sample data creation skipped.');
    }
    
    console.log('\n✅ Database initialization complete!');
    console.log('\nYou can now start the application:');
    console.log('1. Start the backend: cd backend && npm run dev');
    console.log('2. Start the frontend: cd frontend && npm start (in a separate terminal)');
    
    await mongoose.disconnect();
    rl.close();
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

// Function to create sample data
async function createSampleData() {
  try {
    // Import models
    const Customer = require('./src/models/Customer');
    const Interaction = require('./src/models/Interaction');
    const Task = require('./src/models/Task');
    const User = require('./src/models/User');
    
    // Get admin user
    const admin = await User.findOne({ email: adminUser.email });
    
    if (!admin) {
      console.log('Admin user not found. Skipping sample data creation.');
      return;
    }
    
    // Check if sample data already exists
    const customerCount = await Customer.countDocuments();
    
    if (customerCount > 0) {
      console.log('Sample data already exists. Skipping sample data creation.');
      return;
    }
    
    console.log('Creating sample data...');
    
    // Create sample customers
    const sampleCustomers = [
      {
        name: 'Acme Corporation',
        email: 'contact@acme.com',
        phone: '555-123-4567',
        company: 'Acme Corp',
        status: 'customer',
        notes: 'Large enterprise client',
        assignedTo: admin._id,
        createdBy: admin._id,
        tags: ['enterprise', 'priority']
      },
      {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '555-987-6543',
        company: 'Smith Consulting',
        status: 'lead',
        notes: 'Interested in premium plan',
        assignedTo: admin._id,
        createdBy: admin._id,
        tags: ['consulting', 'new']
      },
      {
        name: 'Global Tech Industries',
        email: 'info@globaltech.com',
        phone: '555-789-0123',
        company: 'Global Tech',
        status: 'customer',
        notes: 'Multinational client',
        assignedTo: admin._id,
        createdBy: admin._id,
        tags: ['tech', 'enterprise']
      }
    ];
    
    const customers = await Customer.insertMany(sampleCustomers);
    console.log(`✅ Created ${customers.length} sample customers`);
    
    // Create sample interactions
    const sampleInteractions = [
      {
        customer: customers[0]._id,
        type: 'call',
        summary: 'Discussed new service requirements',
        details: 'Client is interested in our premium support package',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        duration: 45,
        outcome: 'positive',
        createdBy: admin._id
      },
      {
        customer: customers[1]._id,
        type: 'email',
        summary: 'Sent pricing information',
        details: 'Detailed pricing breakdown of our services',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        outcome: 'neutral',
        createdBy: admin._id
      },
      {
        customer: customers[2]._id,
        type: 'meeting',
        summary: 'Quarterly review meeting',
        details: 'Discussed current projects and future roadmap',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        duration: 120,
        outcome: 'positive',
        createdBy: admin._id
      }
    ];
    
    const interactions = await Interaction.insertMany(sampleInteractions);
    console.log(`✅ Created ${interactions.length} sample interactions`);
    
    // Create sample tasks
    const sampleTasks = [
      {
        title: 'Follow up with Acme Corp',
        description: 'Call to discuss implementation timeline',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        status: 'pending',
        priority: 'high',
        customer: customers[0]._id,
        assignedTo: admin._id,
        createdBy: admin._id
      },
      {
        title: 'Send proposal to John Smith',
        description: 'Prepare and send detailed service proposal',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        status: 'in-progress',
        priority: 'medium',
        customer: customers[1]._id,
        assignedTo: admin._id,
        createdBy: admin._id
      },
      {
        title: 'Prepare quarterly report',
        description: 'Create performance report for Global Tech',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        status: 'pending',
        priority: 'medium',
        customer: customers[2]._id,
        assignedTo: admin._id,
        createdBy: admin._id
      }
    ];
    
    const tasks = await Task.insertMany(sampleTasks);
    console.log(`✅ Created ${tasks.length} sample tasks`);
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  }
}

// Run the initialization
initDatabase(); 