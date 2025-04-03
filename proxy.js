import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const port = 3333;

// Enable CORS
app.use(cors({
  origin: '*',
  credentials: true
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Create proxy middleware
const apiProxy = createProxyMiddleware('/api', {
  target: 'http://localhost:3000',
  changeOrigin: true,
  secure: false,
  logLevel: 'debug'
});

// Use the proxy for /api routes
app.use('/api', apiProxy);

// Fallback page
app.use('*', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>ShortDramaVerse Development Proxy</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; }
        .panel { background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .btn { background: #4a90e2; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; }
        input, textarea { width: 100%; padding: 8px; margin: 8px 0; box-sizing: border-box; }
        pre { background: #eee; padding: 10px; overflow: auto; }
      </style>
    </head>
    <body>
      <h1>ShortDramaVerse Development Proxy</h1>
      
      <div class="panel">
        <p>This is a development proxy for ShortDramaVerse. The application server is running, but we're 
        handling Vite host restrictions with this proxy interface.</p>
      </div>
      
      <div class="panel">
        <h2>API Tester</h2>
        <select id="method">
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
        <input type="text" id="endpoint" placeholder="/api/..." value="/api/user" />
        <button class="btn" onclick="testEndpoint()">Send Request</button>
        
        <div id="bodyContainer" style="margin-top: 10px;">
          <p>Request Body (for POST/PUT):</p>
          <textarea id="requestBody" rows="5" placeholder='{"key": "value"}'></textarea>
        </div>
        
        <div style="margin-top: 20px;">
          <h3>Response:</h3>
          <pre id="response">// Response will appear here</pre>
        </div>
      </div>
      
      <script>
        async function testEndpoint() {
          const method = document.getElementById('method').value;
          const endpoint = document.getElementById('endpoint').value;
          const bodyText = document.getElementById('requestBody').value;
          const responseArea = document.getElementById('response');
          
          responseArea.textContent = 'Loading...';
          
          try {
            const options = {
              method: method,
              headers: {
                'Content-Type': 'application/json'
              },
              credentials: 'include'
            };
            
            if (method !== 'GET' && bodyText.trim()) {
              try {
                options.body = bodyText.trim();
              } catch (e) {
                responseArea.textContent = 'Error parsing JSON: ' + e.message;
                return;
              }
            }
            
            const response = await fetch(endpoint, options);
            let data;
            
            try {
              data = await response.json();
              responseArea.textContent = JSON.stringify(data, null, 2);
            } catch {
              const text = await response.text();
              responseArea.textContent = text || '(Empty response)';
            }
            
            responseArea.textContent = 'Status: ' + response.status + ' ' + response.statusText + '\n\n' + responseArea.textContent;
            
          } catch (error) {
            responseArea.textContent = 'Error: ' + error.message;
          }
        }
      </script>
    </body>
    </html>
  `);
});

// Start the proxy server
app.listen(port, '0.0.0.0', () => {
  console.log(`Proxy server running at http://0.0.0.0:${port}`);
});