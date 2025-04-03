// ShortDramaVerse - Authentication Component Tester
// This is a CommonJS script to test authentication components

const fetch = require('node-fetch');
const chalk = require('chalk');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const DEFAULT_USERNAME = 'testuser';
const DEFAULT_PASSWORD = 'password123';
const DEFAULT_EMAIL = 'testuser@example.com';

// Helper function for API requests
async function apiRequest(endpoint, method = 'GET', body = null) {
  const url = `${API_URL}${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({ status: response.status }));
    
    return {
      status: response.status,
      data,
    };
  } catch (error) {
    console.error(chalk.red(`Error making request to ${url}:`), error.message);
    return { status: 500, data: { error: error.message } };
  }
}

// Test registration
async function testRegistration(username = DEFAULT_USERNAME, email = DEFAULT_EMAIL, password = DEFAULT_PASSWORD) {
  console.log(chalk.cyan('\nTesting user registration...'));
  
  const userData = {
    username,
    email,
    password,
    displayName: `Test User ${Math.floor(Math.random() * 1000)}`,
    profilePicture: null,
    bio: 'This is a test user account created by the authentication tester.',
    isAdmin: false,
    coinBalance: 100
  };
  
  console.log(chalk.gray(`Registering user: ${username} / ${email}`));
  
  const result = await apiRequest('/register', 'POST', userData);
  
  if (result.status === 201) {
    console.log(chalk.green('✓ Registration successful!'));
    console.log(chalk.gray('User data:'), JSON.stringify(result.data, null, 2));
    return true;
  } else {
    console.log(chalk.red(`✗ Registration failed with status ${result.status}`));
    console.log(chalk.gray('Error:'), JSON.stringify(result.data, null, 2));
    return false;
  }
}

// Test login
async function testLogin(username = DEFAULT_USERNAME, password = DEFAULT_PASSWORD) {
  console.log(chalk.cyan('\nTesting user login...'));
  
  const credentials = {
    username,
    password
  };
  
  console.log(chalk.gray(`Logging in with username: ${username}`));
  
  const result = await apiRequest('/login', 'POST', credentials);
  
  if (result.status === 200) {
    console.log(chalk.green('✓ Login successful!'));
    console.log(chalk.gray('User data:'), JSON.stringify(result.data, null, 2));
    return true;
  } else {
    console.log(chalk.red(`✗ Login failed with status ${result.status}`));
    console.log(chalk.gray('Error:'), JSON.stringify(result.data, null, 2));
    return false;
  }
}

// Test getting current user
async function testGetUser() {
  console.log(chalk.cyan('\nTesting get current user...'));
  
  const result = await apiRequest('/user');
  
  if (result.status === 200) {
    console.log(chalk.green('✓ Got user profile successfully!'));
    console.log(chalk.gray('User data:'), JSON.stringify(result.data, null, 2));
    return true;
  } else {
    console.log(chalk.red(`✗ Getting user failed with status ${result.status}`));
    console.log(chalk.gray('Error:'), JSON.stringify(result.data, null, 2));
    return false;
  }
}

// Test logout
async function testLogout() {
  console.log(chalk.cyan('\nTesting user logout...'));
  
  const result = await apiRequest('/logout', 'POST');
  
  if (result.status === 200) {
    console.log(chalk.green('✓ Logout successful!'));
    return true;
  } else {
    console.log(chalk.red(`✗ Logout failed with status ${result.status}`));
    console.log(chalk.gray('Error:'), JSON.stringify(result.data, null, 2));
    return false;
  }
}

// Main test function
async function runTests() {
  console.log(chalk.bold.cyan('\n🔒 ShortDramaVerse Authentication Component Tester'));
  console.log(chalk.cyan('-----------------------------------------------'));
  console.log(chalk.gray(`Using API URL: ${API_URL}`));
  
  // Generate a random username to avoid conflicts
  const timestamp = Date.now().toString().slice(-5);
  const randomUsername = `test_user_${timestamp}`;
  const randomEmail = `test_${timestamp}@example.com`;
  
  try {
    // Run all tests in sequence
    console.log(chalk.yellow('\nRunning authentication tests with random user...'));
    
    // Test registration with random user
    const registrationSuccess = await testRegistration(randomUsername, randomEmail);
    
    if (registrationSuccess) {
      // Test login with the registered user
      const loginSuccess = await testLogin(randomUsername);
      
      if (loginSuccess) {
        // Test getting user profile
        await testGetUser();
        
        // Test logout
        await testLogout();
      }
    }
    
    // Additional test with default user (if it exists)
    console.log(chalk.yellow('\nRunning authentication tests with default user...'));
    const defaultLoginSuccess = await testLogin();
    
    if (defaultLoginSuccess) {
      await testGetUser();
      await testLogout();
    }
    
    console.log(chalk.bold.green('\n✓ Authentication component tests completed!'));
    
  } catch (error) {
    console.error(chalk.bold.red('\n✗ Authentication component tests failed!'));
    console.error(chalk.red(error));
  }
}

// Run the tests
runTests().catch(console.error);