// Test script for ShortDramaVerse API
import fetch from 'node-fetch';
import { argv } from 'process';

const API_BASE_URL = 'http://localhost:3000/api';
const DEFAULT_USERNAME = 'testuser';
const DEFAULT_PASSWORD = 'password123';

// Utility function for API requests
async function apiRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`Making ${method} request to ${url}`);
  
  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      return {
        status: response.status,
        ok: response.ok,
        data,
      };
    } else {
      const text = await response.text();
      return {
        status: response.status,
        ok: response.ok,
        data: text,
      };
    }
  } catch (error) {
    console.error('API request failed:', error.message);
    return {
      status: 500,
      ok: false,
      error: error.message,
    };
  }
}

// Test user registration
async function testRegistration(username = DEFAULT_USERNAME, email = `${username}@example.com`, password = DEFAULT_PASSWORD) {
  console.log('\n===== Testing Registration =====');
  
  // Generate a unique username to avoid conflicts with existing users
  const uniqueUsername = `${username}_${Date.now().toString().slice(-6)}`;
  
  const userData = {
    username: uniqueUsername,
    email: email.replace('@', `_${Date.now().toString().slice(-6)}@`),
    password,
    displayName: `Test User ${uniqueUsername}`,
  };
  
  console.log(`Registering user: ${userData.username} (${userData.email})`);
  
  const result = await apiRequest('/register', 'POST', userData);
  
  if (result.ok) {
    console.log('✅ Registration successful!');
    console.log('User data:', result.data);
    return result.data;
  } else {
    console.log('❌ Registration failed!');
    console.log('Error:', result.data);
    return null;
  }
}

// Test user login
async function testLogin(username = DEFAULT_USERNAME, password = DEFAULT_PASSWORD) {
  console.log('\n===== Testing Login =====');
  
  const loginData = {
    username,
    password,
  };
  
  console.log(`Logging in as: ${loginData.username}`);
  
  const result = await apiRequest('/login', 'POST', loginData);
  
  if (result.ok) {
    console.log('✅ Login successful!');
    console.log('User data:', result.data);
    return result.data;
  } else {
    console.log('❌ Login failed!');
    console.log('Error:', result.data);
    return null;
  }
}

// Test getting current user
async function testGetUser() {
  console.log('\n===== Testing Get Current User =====');
  
  const result = await apiRequest('/user');
  
  if (result.ok) {
    console.log('✅ Got user data successfully!');
    console.log('User data:', result.data);
    return result.data;
  } else {
    console.log('❌ Failed to get user data!');
    console.log('Error:', result.data);
    return null;
  }
}

// Test user logout
async function testLogout() {
  console.log('\n===== Testing Logout =====');
  
  const result = await apiRequest('/logout', 'POST');
  
  if (result.ok) {
    console.log('✅ Logout successful!');
    return true;
  } else {
    console.log('❌ Logout failed!');
    console.log('Error:', result.data);
    return false;
  }
}

// Test getting drama series
async function testGetDramaSeries() {
  console.log('\n===== Testing Get Drama Series =====');
  
  const result = await apiRequest('/drama-series');
  
  if (result.ok) {
    console.log('✅ Got drama series successfully!');
    console.log(`Retrieved ${result.data.length} series`);
    console.log('First few series:', result.data.slice(0, 3));
    return result.data;
  } else {
    console.log('❌ Failed to get drama series!');
    console.log('Error:', result.data);
    return null;
  }
}

// Test getting episodes for a series
async function testGetEpisodes(seriesId) {
  console.log(`\n===== Testing Get Episodes for Series ${seriesId} =====`);
  
  const result = await apiRequest(`/drama-series/${seriesId}/episodes`);
  
  if (result.ok) {
    console.log('✅ Got episodes successfully!');
    console.log(`Retrieved ${result.data.length} episodes`);
    console.log('Episodes:', result.data);
    return result.data;
  } else {
    console.log('❌ Failed to get episodes!');
    console.log('Error:', result.data);
    return null;
  }
}

// Run specific test based on command line argument
async function runSpecificTest() {
  const testName = argv[2];
  const param1 = argv[3];
  const param2 = argv[4];
  
  switch (testName) {
    case 'register':
      await testRegistration(param1, param1 ? `${param1}@example.com` : undefined, param2);
      break;
    case 'login':
      await testLogin(param1, param2);
      break;
    case 'user':
      await testGetUser();
      break;
    case 'logout':
      await testLogout();
      break;
    case 'series':
      await testGetDramaSeries();
      break;
    case 'episodes':
      await testGetEpisodes(param1);
      break;
    default:
      console.log(`Unknown test: ${testName}`);
      console.log('Available tests: register, login, user, logout, series, episodes');
  }
}

// Run all tests in sequence
async function runTests() {
  // Check if we're running a specific test
  if (argv.length > 2) {
    return runSpecificTest();
  }
  
  // Register a new user
  const user = await testRegistration();
  if (!user) {
    console.log('Skipping remaining tests because registration failed.');
    return;
  }
  
  // Logout (to test login)
  await testLogout();
  
  // Login with the new user
  const loggedInUser = await testLogin(user.username, DEFAULT_PASSWORD);
  if (!loggedInUser) {
    console.log('Skipping remaining tests because login failed.');
    return;
  }
  
  // Get user data
  await testGetUser();
  
  // Get drama series
  const series = await testGetDramaSeries();
  
  // Get episodes for the first series if available
  if (series && series.length > 0) {
    await testGetEpisodes(series[0].id);
  }
  
  // Logout
  await testLogout();
  
  console.log('\n✅ All tests completed!');
}

// Run the tests
runTests().catch(error => {
  console.error('Test script error:', error);
});