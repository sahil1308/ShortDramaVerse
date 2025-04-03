// Development server for ShortDramaVerse (CommonJS version)
// Provides a simple HTTP interface for testing and development

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

// Create app
const app = express();
const port = 8080;

// Create API proxy middleware
const apiProxy = createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api',
  },
  onProxyReq: (proxyReq, req, res) => {
    // Log the request
    console.log(`[PROXY] ${req.method} ${req.path} -> http://localhost:3000${req.path}`);
  },
});

// Use the proxy middleware
app.use('/api', apiProxy);

// Server the home page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>ShortDramaVerse Development Server</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f7f7f7;
          color: #333;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #6a0dad;
          color: white;
          padding: 20px;
          text-align: center;
        }
        .content {
          background-color: white;
          padding: 20px;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          margin-top: 20px;
        }
        nav {
          background-color: #f0f0f0;
          padding: 10px;
          margin-top: 20px;
          border-radius: 5px;
        }
        nav a {
          margin-right: 15px;
          color: #6a0dad;
          text-decoration: none;
          font-weight: bold;
        }
        .card {
          background-color: #f0f0f0;
          padding: 15px;
          border-radius: 5px;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>ShortDramaVerse Development Server</h1>
      </div>
      
      <div class="container">
        <nav>
          <a href="/">Home</a>
          <a href="/api-test">API Tester</a>
          <a href="/auth">Authentication</a>
          <a href="/about">About</a>
        </nav>
        
        <div class="content">
          <h2>Welcome to ShortDramaVerse Development</h2>
          <p>This is a development server for ShortDramaVerse, a web-based streaming platform for short-form drama content.</p>
          
          <div class="card">
            <h3>API Testing</h3>
            <p>You can test the API endpoints using the <a href="/api-test">API Tester</a> page.</p>
            <p>The API server runs on port 3000 and this development server proxies all API requests.</p>
          </div>
          
          <div class="card">
            <h3>Authentication</h3>
            <p>You can test authentication functionality using the <a href="/auth">Authentication</a> page.</p>
            <p>This includes user registration, login, and session management.</p>
          </div>
          
          <div class="card">
            <h3>About</h3>
            <p>For more information about this development server, visit the <a href="/about">About</a> page.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

// API test page
app.get('/api-test', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>API Tester - ShortDramaVerse Development Server</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f7f7f7;
          color: #333;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #6a0dad;
          color: white;
          padding: 20px;
          text-align: center;
        }
        .content {
          background-color: white;
          padding: 20px;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          margin-top: 20px;
        }
        nav {
          background-color: #f0f0f0;
          padding: 10px;
          margin-top: 20px;
          border-radius: 5px;
        }
        nav a {
          margin-right: 15px;
          color: #6a0dad;
          text-decoration: none;
          font-weight: bold;
        }
        .card {
          background-color: #f0f0f0;
          padding: 15px;
          border-radius: 5px;
          margin: 10px 0;
        }
        .form-group {
          margin-bottom: 15px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        input[type="text"], textarea, select {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-sizing: border-box;
          font-family: monospace;
        }
        textarea {
          height: 100px;
          resize: vertical;
        }
        .button {
          background-color: #6a0dad;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }
        .button:hover {
          background-color: #5a0c8f;
        }
        .result-container {
          margin-top: 20px;
          background-color: #f0f0f0;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 10px;
          font-family: monospace;
          white-space: pre-wrap;
          height: 200px;
          overflow-y: auto;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>API Tester</h1>
      </div>
      
      <div class="container">
        <nav>
          <a href="/">Home</a>
          <a href="/api-test">API Tester</a>
          <a href="/auth">Authentication</a>
          <a href="/about">About</a>
        </nav>
        
        <div class="content">
          <h2>Test API Endpoints</h2>
          <p>Use this form to test the API endpoints of the ShortDramaVerse application.</p>
          
          <div class="form-group">
            <label for="endpoint">API Endpoint:</label>
            <select id="endpoint">
              <option value="/api/user">GET /api/user (Current User)</option>
              <option value="/api/drama-series">GET /api/drama-series (All Series)</option>
              <option value="/api/watchlist">GET /api/watchlist (User's Watchlist)</option>
              <option value="/api/watch-history">GET /api/watch-history (User's Watch History)</option>
              <option value="/api/admin/users">GET /api/admin/users (All Users - Admin)</option>
              <option value="/api/admin/ads">GET /api/admin/ads (All Ads - Admin)</option>
              <option value="/api/custom">Custom Endpoint</option>
            </select>
          </div>
          
          <div id="customEndpointContainer" class="form-group" style="display: none;">
            <label for="customEndpoint">Custom Endpoint:</label>
            <input type="text" id="customEndpoint" placeholder="/api/...">
          </div>
          
          <div class="form-group">
            <label for="method">HTTP Method:</label>
            <select id="method">
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          
          <div id="requestBodyContainer" class="form-group" style="display: none;">
            <label for="requestBody">Request Body (JSON):</label>
            <textarea id="requestBody" placeholder='{"key": "value"}'></textarea>
          </div>
          
          <button class="button" onclick="sendRequest()">Send Request</button>
          
          <div class="result-container">
            <div id="result">Results will appear here...</div>
          </div>
        </div>
      </div>
      
      <script>
        // Show/hide custom endpoint field
        document.getElementById('endpoint').addEventListener('change', function() {
          const customEndpointContainer = document.getElementById('customEndpointContainer');
          if (this.value === '/api/custom') {
            customEndpointContainer.style.display = 'block';
          } else {
            customEndpointContainer.style.display = 'none';
          }
        });
        
        // Show/hide request body field
        document.getElementById('method').addEventListener('change', function() {
          const requestBodyContainer = document.getElementById('requestBodyContainer');
          if (this.value === 'POST' || this.value === 'PUT') {
            requestBodyContainer.style.display = 'block';
          } else {
            requestBodyContainer.style.display = 'none';
          }
        });
        
        function sendRequest() {
          const endpointSelect = document.getElementById('endpoint');
          const customEndpoint = document.getElementById('customEndpoint');
          const method = document.getElementById('method').value;
          const requestBody = document.getElementById('requestBody').value;
          const resultElement = document.getElementById('result');
          
          let endpoint = endpointSelect.value;
          if (endpoint === '/api/custom') {
            endpoint = customEndpoint.value;
            if (!endpoint.startsWith('/api/')) {
              endpoint = '/api/' + endpoint.replace(/^\/+/, '');
            }
          }
          
          resultElement.textContent = 'Sending request...';
          
          const options = {
            method: method,
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          };
          
          if ((method === 'POST' || method === 'PUT') && requestBody.trim()) {
            try {
              options.body = requestBody;
            } catch (e) {
              resultElement.textContent = 'Error parsing JSON: ' + e.message;
              return;
            }
          }
          
          fetch(endpoint, options)
            .then(response => {
              const statusText = response.status + ' ' + response.statusText;
              resultElement.textContent = 'Response: ' + statusText + '\n\n';
              return response.json().catch(() => ({ error: 'Invalid JSON or empty response' }));
            })
            .then(data => {
              resultElement.textContent += JSON.stringify(data, null, 2);
            })
            .catch(error => {
              resultElement.textContent = 'Error: ' + error.message;
            });
        }
      </script>
    </body>
    </html>
  `);
});

// Authentication page
app.get('/auth', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Authentication - ShortDramaVerse Development Server</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f7f7f7;
          color: #333;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #6a0dad;
          color: white;
          padding: 20px;
          text-align: center;
        }
        .content {
          background-color: white;
          padding: 20px;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          margin-top: 20px;
        }
        nav {
          background-color: #f0f0f0;
          padding: 10px;
          margin-top: 20px;
          border-radius: 5px;
        }
        nav a {
          margin-right: 15px;
          color: #6a0dad;
          text-decoration: none;
          font-weight: bold;
        }
        .card {
          background-color: #f0f0f0;
          padding: 15px;
          border-radius: 5px;
          margin: 10px 0;
        }
        .form-group {
          margin-bottom: 15px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        input[type="text"], input[type="password"], input[type="email"] {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-sizing: border-box;
        }
        .button {
          background-color: #6a0dad;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          width: 100%;
        }
        .button:hover {
          background-color: #5a0c8f;
        }
        .tabs {
          display: flex;
          margin-bottom: 20px;
        }
        .tab {
          padding: 10px 20px;
          cursor: pointer;
          background-color: #f0f0f0;
          border-radius: 5px 5px 0 0;
          margin-right: 5px;
        }
        .tab.active {
          background-color: #6a0dad;
          color: white;
        }
        .tab-content {
          display: none;
        }
        .tab-content.active {
          display: block;
        }
        .form-container {
          margin-top: 20px;
        }
        .error-message {
          color: red;
          margin-top: 5px;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Authentication Testing</h1>
      </div>
      
      <div class="container">
        <nav>
          <a href="/">Home</a>
          <a href="/api-test">API Tester</a>
          <a href="/auth">Authentication</a>
          <a href="/about">About</a>
        </nav>
        
        <div class="content">
          <h2>Test Authentication</h2>
          <p>Use these forms to test user registration and login functionality.</p>
          
          <div class="tabs">
            <div class="tab active" onclick="showTab('login')">Login</div>
            <div class="tab" onclick="showTab('register')">Register</div>
          </div>
          
          <div id="login" class="tab-content active">
            <div class="form-container">
              <div class="form-group">
                <label for="loginUsername">Username:</label>
                <input type="text" id="loginUsername" placeholder="Enter your username">
              </div>
              
              <div class="form-group">
                <label for="loginPassword">Password:</label>
                <input type="password" id="loginPassword" placeholder="Enter your password">
              </div>
              
              <div id="loginError" class="error-message"></div>
              
              <button class="button" onclick="login()">Login</button>
            </div>
          </div>
          
          <div id="register" class="tab-content">
            <div class="form-container">
              <div class="form-group">
                <label for="registerUsername">Username:</label>
                <input type="text" id="registerUsername" placeholder="Choose a username">
              </div>
              
              <div class="form-group">
                <label for="registerEmail">Email:</label>
                <input type="email" id="registerEmail" placeholder="Enter your email">
              </div>
              
              <div class="form-group">
                <label for="registerPassword">Password:</label>
                <input type="password" id="registerPassword" placeholder="Choose a password">
              </div>
              
              <div class="form-group">
                <label for="registerDisplayName">Display Name:</label>
                <input type="text" id="registerDisplayName" placeholder="Enter your display name">
              </div>
              
              <div id="registerError" class="error-message"></div>
              
              <button class="button" onclick="register()">Register</button>
            </div>
          </div>
        </div>
      </div>
      
      <script>
        function showTab(tabName) {
          // Hide all tabs
          document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
          });
          
          // Show the selected tab
          document.getElementById(tabName).classList.add('active');
          
          // Update tab buttons
          document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
          });
          
          // Find and activate the button that was clicked
          document.querySelectorAll('.tab').forEach(tab => {
            if (tab.textContent.toLowerCase() === tabName) {
              tab.classList.add('active');
            }
          });
        }
        
        function login() {
          const username = document.getElementById('loginUsername').value;
          const password = document.getElementById('loginPassword').value;
          const errorDiv = document.getElementById('loginError');
          
          if (!username || !password) {
            errorDiv.textContent = "Username and password are required.";
            return;
          }
          
          errorDiv.textContent = "";
          
          fetch('/api/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
          })
          .then(response => {
            if (!response.ok) {
              throw new Error('Login failed. Please check your credentials.');
            }
            return response.json();
          })
          .then(user => {
            // Add logged in status
            const formContainer = document.querySelector('.form-container');
            // Build the HTML content without template literals to avoid LSP issues
            const content = '<h2>Login Successful</h2>' +
              '<p>You are now logged in as <strong>' + user.username + '</strong>.</p>' +
              '<p>User ID: ' + user.id + '</p>' +
              '<p>Email: ' + user.email + '</p>' +
              '<p>Display Name: ' + (user.displayName || user.username) + '</p>' +
              '<button class="button" onclick="logout()">Logout</button>';
            formContainer.innerHTML = content;
          })
          .catch(error => {
            errorDiv.textContent = error.message;
          });
        }
        
        function register() {
          const username = document.getElementById('registerUsername').value;
          const email = document.getElementById('registerEmail').value;
          const password = document.getElementById('registerPassword').value;
          const displayName = document.getElementById('registerDisplayName').value;
          const errorDiv = document.getElementById('registerError');
          
          if (!username || !email || !password) {
            errorDiv.textContent = "Username, email, and password are required.";
            return;
          }
          
          errorDiv.textContent = "";
          
          fetch('/api/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              username, 
              email, 
              password,
              displayName: displayName || null
            }),
            credentials: 'include'
          })
          .then(response => {
            if (!response.ok) {
              throw new Error('Registration failed. Username may be taken.');
            }
            return response.json();
          })
          .then(user => {
            // Show success message
            const formContainer = document.querySelector('.form-container');
            // Build the HTML content without template literals
            const content = '<h2>Registration Successful</h2>' +
              '<p>You are now registered and logged in as <strong>' + user.username + '</strong>.</p>' +
              '<p>User ID: ' + user.id + '</p>' +
              '<p>Email: ' + user.email + '</p>' +
              '<p>Display Name: ' + (user.displayName || user.username) + '</p>' +
              '<button class="button" onclick="logout()">Logout</button>';
            formContainer.innerHTML = content;
          })
          .catch(error => {
            errorDiv.textContent = error.message;
          });
        }
        
        function logout() {
          fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'
          })
          .then(() => {
            window.location.reload();
          });
        }
        
        // Check if the user is already logged in
        fetch('/api/user', {
          credentials: 'include'
        })
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          return null;
        })
        .then(user => {
          if (user) {
            // Add logged in status
            const formContainer = document.querySelector('.form-container');
            // Build the HTML content without template literals
            const content = '<h2>Already Authenticated</h2>' +
              '<p>You are currently logged in as <strong>' + user.username + '</strong>.</p>' +
              '<p>User ID: ' + user.id + '</p>' +
              '<p>Email: ' + user.email + '</p>' +
              '<p>Display Name: ' + (user.displayName || user.username) + '</p>' +
              '<button class="button" onclick="logout()">Logout</button>';
            formContainer.innerHTML = content;
          }
        });
      </script>
    </body>
    </html>
  `);
});

// About page
app.get('/about', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>About - ShortDramaVerse Development Server</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f7f7f7;
          color: #333;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #6a0dad;
          color: white;
          padding: 20px;
          text-align: center;
        }
        .content {
          background-color: white;
          padding: 20px;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          margin-top: 20px;
        }
        nav {
          background-color: #f0f0f0;
          padding: 10px;
          margin-top: 20px;
          border-radius: 5px;
        }
        nav a {
          margin-right: 15px;
          color: #6a0dad;
          text-decoration: none;
          font-weight: bold;
        }
        .card {
          background-color: #f0f0f0;
          padding: 15px;
          border-radius: 5px;
          margin: 10px 0;
        }
        code {
          background-color: #f0f0f0;
          padding: 2px 5px;
          border-radius: 3px;
          font-family: monospace;
        }
        .code-block {
          background-color: #f0f0f0;
          padding: 10px;
          border-radius: 5px;
          overflow-x: auto;
          font-family: monospace;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>About ShortDramaVerse</h1>
      </div>
      
      <div class="container">
        <nav>
          <a href="/">Home</a>
          <a href="/api-test">API Tester</a>
          <a href="/auth">Authentication</a>
          <a href="/about">About</a>
        </nav>
        
        <div class="content">
          <h2>About This Server</h2>
          <p>This is a development server for ShortDramaVerse, a web-based streaming platform for short-form drama content. The development server provides a simple interface for testing the application's API endpoints and functionality.</p>
          
          <div class="card">
            <h3>Technical Details</h3>
            <p>The ShortDramaVerse application consists of:</p>
            <ul>
              <li><strong>Backend API</strong>: Express.js server with authentication and data storage</li>
              <li><strong>Frontend</strong>: React-based client using Vite for development</li>
              <li><strong>Development Server</strong>: Simple Express.js server for testing</li>
            </ul>
          </div>
          
          <div class="card">
            <h3>Available Services</h3>
            <p>The following services are provided for development:</p>
            <ul>
              <li><strong>API Server</strong>: Runs on port 3000 and provides all backend functionality</li>
              <li><strong>Development Server</strong>: Runs on port 8080 and provides this UI</li>
              <li><strong>API Proxy</strong>: Runs on port 3333 and provides a dedicated API testing interface</li>
              <li><strong>Client App</strong>: Runs on port 8888 and provides a simplified client application</li>
            </ul>
          </div>
          
          <div class="card">
            <h3>Testing the API</h3>
            <p>You can test the API endpoints using the <a href="/api-test">API Tester</a> page or by making direct requests to <code>http://localhost:3000/api/...</code></p>
            <p>Example API request using fetch:</p>
            <div class="code-block">
fetch('/api/drama-series', {
  credentials: 'include'
})
.then(response => response.json())
.then(data => console.log(data));
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Development server running at http://0.0.0.0:${port}`);
});