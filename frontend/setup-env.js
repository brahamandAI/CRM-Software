/**
 * Frontend Environment Setup Script for Brahamand CRM
 * 
 * This script helps set up the frontend .env file.
 * Run with: node setup-env.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
const envSampleContent = `# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# App Configuration
REACT_APP_NAME=Brahamand CRM
REACT_APP_VERSION=1.0.0

# For production build
# REACT_APP_API_URL=https://your-production-api.com/api
`;

// Create prompt interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Check if .env exists
if (!fs.existsSync(envPath)) {
  console.log('Creating .env file with default configuration...');
  fs.writeFileSync(envPath, envSampleContent);
  console.log('.env file created successfully!');
} else {
  console.log('.env file already exists.');
  rl.question('Do you want to overwrite it with default settings? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      fs.writeFileSync(envPath, envSampleContent);
      console.log('.env file updated successfully!');
    } else {
      console.log('Keeping existing .env file.');
    }
    rl.close();
  });
  return;
}

console.log('\nEnvironment setup complete!');
console.log('\nTo start the frontend application:');
console.log('1. Make sure backend is running');
console.log('2. Run: npm start');

rl.close(); 