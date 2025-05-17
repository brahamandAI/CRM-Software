/**
 * MongoDB Setup Script for Brahamand CRM
 * 
 * This script helps set up and verify your MongoDB Atlas connection.
 * Run with: node setup-mongodb.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Create prompt interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get MongoDB Atlas connection details
function getAtlasConnectionDetails() {
  return new Promise((resolve) => {
    console.log('\n=== MongoDB Atlas Connection Setup ===');
    console.log('You can find your connection string in the MongoDB Atlas dashboard:');
    console.log('1. Log in to MongoDB Atlas (https://cloud.mongodb.com)');
    console.log('2. Go to your cluster and click "Connect"');
    console.log('3. Choose "Connect your application"');
    console.log('4. Copy the connection string\n');
    
    rl.question('Enter your MongoDB Atlas connection string: ', (connectionString) => {
      if (!connectionString || !connectionString.includes('mongodb+srv://')) {
        console.log('Invalid connection string. Please provide a valid MongoDB Atlas connection string.');
        return getAtlasConnectionDetails().then(resolve);
      }
      
      resolve(connectionString);
    });
  });
}

// Create .env file with MongoDB Atlas connection
async function setupEnvFile() {
  const envPath = path.join(__dirname, '.env');
  
  try {
    // Get MongoDB Atlas connection details
    const connectionString = await getAtlasConnectionDetails();
    
    const envContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=${connectionString}

# JWT Configuration
JWT_SECRET=brahamand_jwt_secret_${Math.random().toString(36).substring(2, 15)}
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
`;

    // Create or update .env file
    fs.writeFileSync(envPath, envContent);
    console.log('\n.env file created successfully with MongoDB Atlas configuration!');
    
    return connectionString;
  } catch (error) {
    console.error('Error setting up .env file:', error);
    process.exit(1);
  }
}

// Test connection to MongoDB Atlas
async function testConnection(connectionString) {
  try {
    console.log('\nTesting connection to MongoDB Atlas...');
    await mongoose.connect(connectionString);
    console.log('✅ MongoDB Atlas connection successful!');
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB Atlas connection failed:', error.message);
    console.log('\nPossible issues:');
    console.log('1. Check if the connection string is correct');
    console.log('2. Ensure your IP address is whitelisted in MongoDB Atlas');
    console.log('3. Check if username and password are correct');
    
    const retry = await new Promise((resolve) => {
      rl.question('\nDo you want to try again? (y/n): ', (answer) => {
        resolve(answer.toLowerCase() === 'y');
      });
    });
    
    if (retry) {
      await setupEnvFile();
      return testConnection(connectionString);
    }
    
    return false;
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  }
}

// Main function
async function main() {
  console.log('=== Brahamand CRM MongoDB Atlas Setup ===');
  
  // Check if .env already exists
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const overwrite = await new Promise((resolve) => {
      rl.question('.env file already exists. Do you want to reconfigure MongoDB connection? (y/n): ', (answer) => {
        resolve(answer.toLowerCase() === 'y');
      });
    });
    
    if (!overwrite) {
      console.log('Setup canceled. Keeping existing configuration.');
      rl.close();
      return;
    }
  }
  
  // Set up MongoDB Atlas connection
  const connectionString = await setupEnvFile();
  const connectionSuccess = await testConnection(connectionString);
  
  if (connectionSuccess) {
    console.log('\n=== MongoDB Atlas Setup Complete ===');
    console.log('\nNext steps:');
    console.log('1. Run "node init-db.js" to initialize the database with admin user and sample data');
    console.log('2. Start the backend server with "npm run dev"');
  } else {
    console.log('\n=== MongoDB Atlas Setup Failed ===');
    console.log('Please try again later or use a local MongoDB instance for development.');
  }
  
  rl.close();
}

// Start the setup process
main(); 