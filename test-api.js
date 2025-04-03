// ShortDramaVerse - API Test Script
// This script tests the main API endpoints

import fetch from 'node-fetch';
import chalk from 'chalk';

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const DEFAULT_USERNAME = 'testuser';
const DEFAULT_PASSWORD = 'password123';

// Session cookie storage to simulate browser
let cookies = '';

// Helper function for API requests
async function apiRequest(endpoint, method = 'GET', body = null) {
  const url = `${API_URL}${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (cookies) {
    options.headers.Cookie = cookies;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    
    // Save cookies for session (if any)
    const responseCookies = response.headers.get('set-cookie');
    if (responseCookies) {
      cookies = responseCookies;
    }
    
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

// Test registration for a new user
async function testRegistration(username = DEFAULT_USERNAME, email = `${username}@example.com`, password = DEFAULT_PASSWORD) {
  console.log(chalk.cyan('\nTesting API: Register User'));
  
  const userData = {
    username,
    email,
    password,
    displayName: `Test User`,
    profilePicture: null,
    bio: 'Test user bio',
    isAdmin: false,
    coinBalance: 100
  };
  
  const result = await apiRequest('/register', 'POST', userData);
  
  if (result.status === 201) {
    console.log(chalk.green('✓ API Registration successful!'));
    return result.data;
  } else {
    console.log(chalk.yellow(`ℹ API Registration returned ${result.status} - user may already exist`));
    return null;
  }
}

// Test login
async function testLogin(username = DEFAULT_USERNAME, password = DEFAULT_PASSWORD) {
  console.log(chalk.cyan('\nTesting API: Login'));
  
  const credentials = {
    username,
    password
  };
  
  const result = await apiRequest('/login', 'POST', credentials);
  
  if (result.status === 200) {
    console.log(chalk.green('✓ API Login successful!'));
    return result.data;
  } else {
    console.log(chalk.red(`✗ API Login failed with status ${result.status}`));
    return null;
  }
}

// Test getting current user
async function testGetUser() {
  console.log(chalk.cyan('\nTesting API: Get Current User'));
  
  const result = await apiRequest('/user');
  
  if (result.status === 200) {
    console.log(chalk.green('✓ API Get User successful!'));
    return result.data;
  } else {
    console.log(chalk.red(`✗ API Get User failed with status ${result.status}`));
    return null;
  }
}

// Test logout
async function testLogout() {
  console.log(chalk.cyan('\nTesting API: Logout'));
  
  const result = await apiRequest('/logout', 'POST');
  
  if (result.status === 200) {
    console.log(chalk.green('✓ API Logout successful!'));
    cookies = ''; // Clear the cookies
    return true;
  } else {
    console.log(chalk.red(`✗ API Logout failed with status ${result.status}`));
    return false;
  }
}

// Test getting all drama series
async function testGetDramaSeries() {
  console.log(chalk.cyan('\nTesting API: Get All Drama Series'));
  
  const result = await apiRequest('/drama-series');
  
  if (result.status === 200) {
    console.log(chalk.green(`✓ API Get Drama Series successful! Found ${result.data.length} series`));
    return result.data;
  } else {
    console.log(chalk.red(`✗ API Get Drama Series failed with status ${result.status}`));
    return [];
  }
}

// Test getting episodes for a series
async function testGetEpisodes(seriesId) {
  console.log(chalk.cyan(`\nTesting API: Get Episodes for Series ${seriesId}`));
  
  const result = await apiRequest(`/drama-series/${seriesId}/episodes`);
  
  if (result.status === 200) {
    console.log(chalk.green(`✓ API Get Episodes successful! Found ${result.data.length} episodes`));
    return result.data;
  } else {
    console.log(chalk.red(`✗ API Get Episodes failed with status ${result.status}`));
    return [];
  }
}

// Run specific test based on command line argument
async function runSpecificTest() {
  const testName = process.argv[2];
  
  if (!testName) {
    return false;
  }
  
  console.log(chalk.yellow(`Running specific test: ${testName}`));
  
  switch (testName) {
    case 'register':
      await testRegistration();
      break;
    case 'login':
      await testLogin();
      break;
    case 'user':
      await testLogin(); // Login first to get session
      await testGetUser();
      break;
    case 'logout':
      await testLogin(); // Login first to get session
      await testLogout();
      break;
    case 'series':
      await testGetDramaSeries();
      break;
    default:
      console.log(chalk.red(`Unknown test: ${testName}`));
      return false;
  }
  
  return true;
}

// Main test function
async function runTests() {
  console.log(chalk.bold.cyan('\n🧪 ShortDramaVerse API Tester'));
  console.log(chalk.cyan('---------------------------'));
  console.log(chalk.gray(`Using API URL: ${API_URL}`));
  
  // Check if we should run a specific test
  const ranSpecificTest = await runSpecificTest();
  if (ranSpecificTest) {
    return;
  }
  
  try {
    // Test authentication
    const timestamp = Date.now().toString().slice(-5);
    const testUsername = `api_test_${timestamp}`;
    
    // Try to register a new user
    await testRegistration(testUsername);
    
    // Login with the user
    const user = await testLogin(testUsername);
    if (!user) {
      // Try default user if the new user didn't work
      await testLogin();
    }
    
    // Get the logged in user
    const currentUser = await testGetUser();
    
    // Test content API endpoints
    const series = await testGetDramaSeries();
    
    // If we have series, test the episodes endpoint
    if (series && series.length > 0) {
      await testGetEpisodes(series[0].id);
    }
    
    // Logout to clean up
    await testLogout();
    
    console.log(chalk.bold.green('\n✓ API tests completed!'));
    
  } catch (error) {
    console.error(chalk.bold.red('\n✗ API tests failed with an error:'));
    console.error(chalk.red(error));
  }
}

// Run the tests
runTests().catch(console.error);