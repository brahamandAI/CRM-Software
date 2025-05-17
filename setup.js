/**
 * Main Setup Script for Brahamand CRM
 * 
 * This script guides you through setting up both backend and frontend with MongoDB Atlas.
 * Run with: node setup.js
 */

const { spawn } = require('child_process');
const readline = require('readline');
const path = require('path');
const fs = require('fs');

// Create prompt interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to run a command
function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`);
    
    const childProcess = spawn(command, args, {
      cwd: cwd,
      stdio: 'inherit',
      shell: true
    });
    
    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    childProcess.on('error', (err) => {
      reject(err);
    });
  });
}

// Create frontend .env file if it doesn't exist
function setupFrontendEnv() {
  const envPath = path.join(__dirname, 'frontend', '.env');
  const envSampleContent = `# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# App Configuration
REACT_APP_NAME=Brahamand CRM
REACT_APP_VERSION=1.0.0

# For production build
# REACT_APP_API_URL=https://your-production-api.com/api
`;

  if (!fs.existsSync(envPath)) {
    console.log('Creating frontend .env file with default configuration...');
    fs.writeFileSync(envPath, envSampleContent);
    console.log('Frontend .env file created successfully!');
  } else {
    console.log('Frontend .env file already exists.');
  }
}

// Main setup function
async function setup() {
  console.log('=== Brahamand CRM Setup (MongoDB Atlas) ===');
  console.log('This script will help you set up your CRM application with MongoDB Atlas.\n');
  
  // Setup frontend environment file
  setupFrontendEnv();
  
  // Ask to install dependencies
  const installDeps = await new Promise((resolve) => {
    rl.question('\nDo you want to install dependencies? (y/n): ', (answer) => {
      resolve(answer.toLowerCase() === 'y');
    });
  });
  
  if (installDeps) {
    try {
      console.log('\n=== Installing Backend Dependencies ===');
      await runCommand('npm', ['install'], path.join(__dirname, 'backend'));
      
      console.log('\n=== Installing Frontend Dependencies ===');
      await runCommand('npm', ['install'], path.join(__dirname, 'frontend'));
      
      console.log('\n=== Dependencies Installed Successfully ===');
    } catch (error) {
      console.error('Error installing dependencies:', error.message);
    }
  }
  
  // Ask to set up MongoDB Atlas
  const setupMongoDB = await new Promise((resolve) => {
    rl.question('\nDo you want to set up MongoDB Atlas connection now? (y/n): ', (answer) => {
      resolve(answer.toLowerCase() === 'y');
    });
  });
  
  if (setupMongoDB) {
    try {
      console.log('\n=== Setting up MongoDB Atlas ===');
      await runCommand('node', ['setup-mongodb.js'], path.join(__dirname, 'backend'));
      
      // Ask to initialize database
      const initDB = await new Promise((resolve) => {
        rl.question('\nDo you want to initialize the database with admin user and sample data? (y/n): ', (answer) => {
          resolve(answer.toLowerCase() === 'y');
        });
      });
      
      if (initDB) {
        console.log('\n=== Initializing Database ===');
        await runCommand('node', ['init-db.js'], path.join(__dirname, 'backend'));
      } else {
        console.log('\nDatabase initialization skipped. You can run it later with:');
        console.log('cd backend && node init-db.js');
      }
    } catch (error) {
      console.error('Error setting up MongoDB Atlas:', error.message);
    }
  } else {
    console.log('\nMongoDB Atlas setup skipped. You can run it later with:');
    console.log('cd backend && node setup-mongodb.js');
  }
  
  console.log('\n=== Setup Complete ===');
  console.log('\nTo start the application:');
  
  if (process.platform === 'win32') {
    console.log('1. In PowerShell, navigate to the backend directory:');
    console.log('   cd backend');
    console.log('2. Start the backend server:');
    console.log('   npm run dev');
    console.log('3. In a separate PowerShell window, navigate to the frontend directory:');
    console.log('   cd frontend');
    console.log('4. Start the frontend server:');
    console.log('   npm start');
  } else {
    console.log('1. Start the backend server:');
    console.log('   cd backend && npm run dev');
    console.log('2. In a separate terminal, start the frontend server:');
    console.log('   cd frontend && npm start');
  }
  
  rl.close();
}

// Run setup
setup(); 