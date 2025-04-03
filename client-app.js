import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create app
const app = express();
const port = 8888;

// Enable CORS
app.use(cors());

// Create proxy middleware for API requests
const apiProxy = createProxyMiddleware('/api', {
  target: 'http://localhost:3000',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api' // No path rewriting needed for this case
  }
});

// Use the proxy for /api routes
app.use('/api', apiProxy);

// Serve a basic client that redirects to our custom interface
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>ShortDramaVerse Client</title>
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
        <h1>ShortDramaVerse</h1>
      </div>
      
      <div class="container">
        <div class="content">
          <h2>Welcome to ShortDramaVerse</h2>
          <p>This is a simple client interface for the ShortDramaVerse application.</p>
          
          <div class="card">
            <h3>Server Status</h3>
            <p>API Server is running at: <strong>http://localhost:3000</strong></p>
            <p>Client Server is running at: <strong>http://localhost:${port}</strong></p>
          </div>
          
          <div class="card">
            <h3>Available Interfaces</h3>
            <p>Please use one of our custom interfaces to interact with the application:</p>
            <ul>
              <li><a href="http://localhost:8080">Development Server</a> - Basic development interface</li>
              <li><a href="http://localhost:3333">API Proxy</a> - API testing interface</li>
            </ul>
            <p>Or use the API directly with testing tools like Postman:</p>
            <code>http://localhost:3000/api/*</code>
          </div>
          
          <a href="/auth" class="button">Go to Authentication Page</a>
        </div>
      </div>
      
      <script>
        // Check if the API server is available
        fetch('/api/user')
          .then(response => {
            const statusDiv = document.getElementById('api-status');
            if (statusDiv) {
              if (response.ok) {
                statusDiv.innerHTML = '<span style="color: green;">API is available</span>';
              } else {
                statusDiv.innerHTML = '<span style="color: orange;">API is available but user not logged in</span>';
              }
            }
          })
          .catch(error => {
            const statusDiv = document.getElementById('api-status');
            if (statusDiv) {
              statusDiv.innerHTML = '<span style="color: red;">API is not available</span>';
            }
          });
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
      <title>ShortDramaVerse - Authentication</title>
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
        .nav-link {
          display: inline-block;
          margin-top: 20px;
          color: #6a0dad;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>ShortDramaVerse</h1>
      </div>
      
      <div class="container">
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
              
              <button class="button" onclick="register()">Create Account</button>
              <div id="registerError" class="error-message"></div>
            </div>
            
            <a href="/" class="nav-link">Back to Home</a>
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
            
            const data = await response.json();
            
            if (response.ok) {
              window.location.href = '/';
            } else {
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
          const errorDiv = document.getElementById('registerError');
          
          if (!username || !email || !password || !confirmPassword) {
            errorDiv.style.display = 'block';
            errorDiv.textContent = 'Please fill in all fields';
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
                displayName: username
              })
            });
            
            const data = await response.json();
            
            if (response.ok) {
              window.location.href = '/';
            } else {
              errorDiv.style.display = 'block';
              errorDiv.textContent = data.message || 'Registration failed';
            }
          } catch (error) {
            errorDiv.style.display = 'block';
            errorDiv.textContent = 'An error occurred. Please try again.';
          }
        }
      </script>
    </body>
    </html>
  `);
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Client app running at http://0.0.0.0:${port}`);
});