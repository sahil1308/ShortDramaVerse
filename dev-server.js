// Development server for ShortDramaVerse
// Provides a simple HTTP interface for testing and development

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create app
const app = express();
const port = 8080;

// Create API proxy middleware
const apiProxy = createProxyMiddleware('/api', {
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
        .card {
          background-color: #f0f0f0;
          padding: 15px;
          border-radius: 5px;
          margin: 10px 0;
        }
        .button {
          display: inline-block;
          background-color: #6a0dad;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 20px;
        }
        .button:hover {
          background-color: #5a0b8d;
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
        .api-test {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
          margin-top: 20px;
        }
        .api-test select, .api-test input, .api-test textarea {
          width: 100%;
          padding: 8px;
          margin-bottom: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .api-test button {
          background-color: #6a0dad;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
        }
        .api-test pre {
          background-color: #f0f0f0;
          padding: 10px;
          border-radius: 4px;
          overflow-x: auto;
          max-height: 200px;
          margin-top: 10px;
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
          <p>This is a simplified development server for ShortDramaVerse. It provides basic testing tools and proxies API requests to the main server.</p>
          
          <div class="card">
            <h3>Server Status</h3>
            <p>Dev Server is running at: <strong>http://localhost:${port}</strong></p>
            <p>API Server is proxied at: <strong>http://localhost:3000</strong></p>
            <p>API Status: <span id="api-status">Checking...</span></p>
          </div>
          
          <div class="card">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="/api-test">API Testing Tool</a> - Test API endpoints</li>
              <li><a href="/auth">Authentication</a> - Login/Register forms</li>
              <li><a href="http://localhost:3333">Full API Proxy</a> - Dedicated API testing interface</li>
            </ul>
          </div>
          
          <div class="api-test">
            <h3>Quick API Test</h3>
            <select id="quick-endpoint">
              <option value="/api/user">GET /api/user (Current User)</option>
              <option value="/api/drama-series">GET /api/drama-series (All Series)</option>
            </select>
            <button id="quick-test-btn">Test Endpoint</button>
            <pre id="quick-result">// Results will appear here</pre>
          </div>
        </div>
      </div>
      
      <script>
        // Check API status
        fetch('/api/user')
          .then(response => {
            const statusElement = document.getElementById('api-status');
            if (response.ok) {
              statusElement.innerHTML = '<span style="color: green;">Connected (User Authenticated)</span>';
            } else if (response.status === 401) {
              statusElement.innerHTML = '<span style="color: orange;">Connected (Not Authenticated)</span>';
            } else {
              statusElement.innerHTML = '<span style="color: red;">Error (' + response.status + ')</span>';
            }
            return response.json().catch(() => ({ error: 'Invalid JSON or empty response' }));
          })
          .catch(() => {
            document.getElementById('api-status').innerHTML = '<span style="color: red;">Connection Failed</span>';
          });
          
        // Quick API test
        document.getElementById('quick-test-btn').addEventListener('click', function() {
          const endpoint = document.getElementById('quick-endpoint').value;
          const resultElement = document.getElementById('quick-result');
          
          resultElement.textContent = 'Loading...';
          
          fetch(endpoint)
            .then(response => {
              return response.json().catch(() => ({ error: 'Invalid JSON or empty response' }));
            })
            .then(data => {
              resultElement.textContent = JSON.stringify(data, null, 2);
            })
            .catch(error => {
              resultElement.textContent = 'Error: ' + error.message;
            });
        });
      </script>
    </body>
    </html>
  `);
});

// API Testing page
app.get('/api-test', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>API Tester - ShortDramaVerse</title>
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
          max-width: 1000px;
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
        .api-form {
          display: grid;
          grid-template-columns: 1fr 2fr;
          grid-gap: 20px;
          margin-top: 20px;
        }
        .api-inputs {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
        }
        .api-results {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        select, input, textarea {
          width: 100%;
          padding: 8px;
          margin-bottom: 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-sizing: border-box;
        }
        textarea {
          min-height: 150px;
          font-family: monospace;
        }
        button {
          background-color: #6a0dad;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
        }
        pre {
          background-color: #f0f0f0;
          padding: 10px;
          border-radius: 4px;
          overflow-x: auto;
          max-height: 400px;
          min-height: 200px;
        }
        .endpoint-list {
          margin-top: 20px;
          background-color: #f0f0f0;
          padding: 15px;
          border-radius: 5px;
        }
        .endpoint-list table {
          width: 100%;
          border-collapse: collapse;
        }
        .endpoint-list th, .endpoint-list td {
          text-align: left;
          padding: 8px;
          border-bottom: 1px solid #ddd;
        }
        .endpoint-list th {
          background-color: #e0e0e0;
        }
        .method-get {
          color: green;
          font-weight: bold;
        }
        .method-post {
          color: blue;
          font-weight: bold;
        }
        .method-delete {
          color: red;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>API Testing Tool</h1>
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
          <p>Use this tool to test the ShortDramaVerse API endpoints.</p>
          
          <div class="endpoint-list">
            <h3>Available Endpoints</h3>
            <table>
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Endpoint</th>
                  <th>Description</th>
                  <th>Auth Required</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="method-post">POST</td>
                  <td>/api/register</td>
                  <td>Create a new user account</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td class="method-post">POST</td>
                  <td>/api/login</td>
                  <td>Authenticate user</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td class="method-post">POST</td>
                  <td>/api/logout</td>
                  <td>Log out current user</td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td class="method-get">GET</td>
                  <td>/api/user</td>
                  <td>Get current user info</td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td class="method-get">GET</td>
                  <td>/api/drama-series</td>
                  <td>Get all drama series</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td class="method-get">GET</td>
                  <td>/api/drama-series/:id</td>
                  <td>Get details for a specific series</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td class="method-get">GET</td>
                  <td>/api/drama-series/:seriesId/episodes</td>
                  <td>Get episodes for a series</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td class="method-get">GET</td>
                  <td>/api/watchlist</td>
                  <td>Get user's watchlist</td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td class="method-post">POST</td>
                  <td>/api/watchlist</td>
                  <td>Add series to watchlist</td>
                  <td>Yes</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="api-form">
            <div class="api-inputs">
              <h3>Request</h3>
              
              <label for="method">Method:</label>
              <select id="method">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
              
              <label for="endpoint">Endpoint:</label>
              <input type="text" id="endpoint" value="/api/user" placeholder="e.g., /api/user">
              
              <label for="body">Request Body (JSON):</label>
              <textarea id="body" placeholder="Enter JSON body for POST/PUT/PATCH requests"></textarea>
              
              <button id="send-request">Send Request</button>
            </div>
            
            <div class="api-results">
              <h3>Response</h3>
              <pre id="response">// Results will appear here</pre>
            </div>
          </div>
        </div>
      </div>
      
      <script>
        document.getElementById('send-request').addEventListener('click', function() {
          const method = document.getElementById('method').value;
          const endpoint = document.getElementById('endpoint').value;
          const body = document.getElementById('body').value;
          const responseElement = document.getElementById('response');
          
          responseElement.textContent = 'Sending request...';
          
          const options = {
            method: method,
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          };
          
          if (method !== 'GET' && method !== 'HEAD' && body.trim()) {
            try {
              options.body = JSON.parse(body);
              options.body = JSON.stringify(options.body); // Ensure proper formatting
            } catch (e) {
              responseElement.textContent = 'Error parsing JSON body: ' + e.message;
              return;
            }
          }
          
          fetch(endpoint, options)
            .then(response => {
              const headers = {};
              response.headers.forEach((value, name) => {
                headers[name] = value;
              });
              
              return response.text().then(text => {
                let data;
                try {
                  data = JSON.parse(text);
                } catch (e) {
                  data = text;
                }
                
                return {
                  status: response.status,
                  statusText: response.statusText,
                  headers: headers,
                  data: data
                };
              });
            })
            .then(result => {
              responseElement.textContent = JSON.stringify(result, null, 2);
            })
            .catch(error => {
              responseElement.textContent = 'Error: ' + error.message;
            });
        });
      </script>
    </body>
    </html>
  `);
});

// Auth page
app.get('/auth', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Authentication - ShortDramaVerse</title>
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
          display: flex;
          flex-wrap: wrap;
        }
        .form-container {
          flex: 1;
          min-width: 300px;
          padding: 10px;
        }
        .hero-container {
          flex: 1;
          min-width: 300px;
          padding: 20px;
          background-color: #6a0dad;
          color: white;
          border-radius: 5px;
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
        .tab-buttons {
          display: flex;
          margin-bottom: 20px;
        }
        .tab-button {
          padding: 10px 20px;
          background-color: #f0f0f0;
          border: none;
          cursor: pointer;
          flex: 1;
        }
        .tab-button.active {
          background-color: #6a0dad;
          color: white;
        }
        input {
          width: 100%;
          padding: 10px;
          margin-bottom: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-sizing: border-box;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        .button {
          display: block;
          width: 100%;
          background-color: #6a0dad;
          color: white;
          padding: 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          margin-top: 10px;
        }
        .button:hover {
          background-color: #5a0b8d;
        }
        .error-message {
          color: red;
          margin-top: 10px;
          padding: 10px;
          background-color: #ffeeee;
          border-radius: 4px;
          display: none;
        }
        .feature-item {
          background-color: rgba(255,255,255,0.1);
          padding: 10px;
          border-radius: 5px;
          margin-bottom: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>ShortDramaVerse Authentication</h1>
      </div>
      
      <div class="container">
        <nav>
          <a href="/">Home</a>
          <a href="/api-test">API Tester</a>
          <a href="/auth">Authentication</a>
          <a href="/about">About</a>
        </nav>
        
        <div class="content">
          <div class="form-container">
            <h2>Authentication</h2>
            
            <div class="tab-buttons">
              <button id="loginTab" class="tab-button active" onclick="showTab('login')">Login</button>
              <button id="registerTab" class="tab-button" onclick="showTab('register')">Register</button>
            </div>
            
            <div id="loginForm">
              <div>
                <label for="loginUsername">Username</label>
                <input type="text" id="loginUsername" placeholder="Enter your username">
              </div>
              
              <div>
                <label for="loginPassword">Password</label>
                <input type="password" id="loginPassword" placeholder="Enter your password">
              </div>
              
              <button class="button" onclick="login()">Login</button>
              <div id="loginError" class="error-message"></div>
            </div>
            
            <div id="registerForm" style="display: none;">
              <div>
                <label for="registerUsername">Username</label>
                <input type="text" id="registerUsername" placeholder="Choose a username">
              </div>
              
              <div>
                <label for="registerEmail">Email</label>
                <input type="email" id="registerEmail" placeholder="Enter your email">
              </div>
              
              <div>
                <label for="registerPassword">Password</label>
                <input type="password" id="registerPassword" placeholder="Choose a password">
              </div>
              
              <div>
                <label for="confirmPassword">Confirm Password</label>
                <input type="password" id="confirmPassword" placeholder="Confirm your password">
              </div>
              
              <div>
                <label for="displayName">Display Name (Optional)</label>
                <input type="text" id="displayName" placeholder="How should we address you?">
              </div>
              
              <button class="button" onclick="register()">Create Account</button>
              <div id="registerError" class="error-message"></div>
            </div>
          </div>
          
          <div class="hero-container">
            <h2>Your Gateway to Drama Series</h2>
            <p>Join ShortDramaVerse to enjoy the best short-form drama content from around the world.</p>
            
            <div class="feature-item">
              <h3>Exclusive Content</h3>
              <p>Access premium episodes and series you won't find anywhere else.</p>
            </div>
            
            <div class="feature-item">
              <h3>Global Selection</h3>
              <p>Explore dramas from Korea, Japan, China and more with high-quality subtitles.</p>
            </div>
            
            <div class="feature-item">
              <h3>Watch Anywhere</h3>
              <p>Enjoy your favorite series on any device, anytime, anywhere.</p>
            </div>
          </div>
        </div>
      </div>
      
      <script>
        function showTab(tab) {
          if (tab === 'login') {
            document.getElementById('loginForm').style.display = 'block';
            document.getElementById('registerForm').style.display = 'none';
            document.getElementById('loginTab').classList.add('active');
            document.getElementById('registerTab').classList.remove('active');
          } else {
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('registerForm').style.display = 'block';
            document.getElementById('loginTab').classList.remove('active');
            document.getElementById('registerTab').classList.add('active');
          }
        }
        
        async function login() {
          const username = document.getElementById('loginUsername').value;
          const password = document.getElementById('loginPassword').value;
          const errorDiv = document.getElementById('loginError');
          
          if (!username || !password) {
            errorDiv.style.display = 'block';
            errorDiv.textContent = 'Please enter both username and password';
            return;
          }
          
          errorDiv.style.display = 'none';
          
          try {
            const response = await fetch('/api/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              credentials: 'include',
              body: JSON.stringify({ username, password })
            });
            
            if (response.ok) {
              const data = await response.json();
              window.location.href = '/';
            } else {
              const data = await response.json();
              errorDiv.style.display = 'block';
              errorDiv.textContent = data.message || 'Login failed';
            }
          } catch (error) {
            errorDiv.style.display = 'block';
            errorDiv.textContent = 'An error occurred. Please try again.';
          }
        }
        
        async function register() {
          const username = document.getElementById('registerUsername').value;
          const email = document.getElementById('registerEmail').value;
          const password = document.getElementById('registerPassword').value;
          const confirmPassword = document.getElementById('confirmPassword').value;
          const displayName = document.getElementById('displayName').value;
          const errorDiv = document.getElementById('registerError');
          
          if (!username || !email || !password || !confirmPassword) {
            errorDiv.style.display = 'block';
            errorDiv.textContent = 'Please fill in all required fields';
            return;
          }
          
          if (password !== confirmPassword) {
            errorDiv.style.display = 'block';
            errorDiv.textContent = 'Passwords do not match';
            return;
          }
          
          if (password.length < 6) {
            errorDiv.style.display = 'block';
            errorDiv.textContent = 'Password must be at least 6 characters';
            return;
          }
          
          errorDiv.style.display = 'none';
          
          try {
            const response = await fetch('/api/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              credentials: 'include',
              body: JSON.stringify({
                username,
                email,
                password,
                displayName: displayName || username
              })
            });
            
            if (response.ok) {
              const data = await response.json();
              window.location.href = '/';
            } else {
              const data = await response.json();
              errorDiv.style.display = 'block';
              errorDiv.textContent = data.message || 'Registration failed';
            }
          } catch (error) {
            errorDiv.style.display = 'block';
            errorDiv.textContent = 'An error occurred. Please try again.';
          }
        }
        
        // Check if user is already logged in
        fetch('/api/user', { credentials: 'include' })
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
              formContainer.innerHTML = `
                <h2>Already Authenticated</h2>
                <p>You are currently logged in as <strong>${user.username}</strong>.</p>
                <p>User ID: ${user.id}</p>
                <p>Email: ${user.email}</p>
                <p>Display Name: ${user.displayName || user.username}</p>
                <button class="button" onclick="logout()">Logout</button>
              `;
            }
          });
          
        function logout() {
          fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'
          })
          .then(() => {
            window.location.reload();
          });
        }
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