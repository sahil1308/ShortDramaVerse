import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';

// Create Express App
const app = express();
const port = 5000; // Default port for Replit workflows

// Enable CORS
app.use(cors({
  origin: '*',
  credentials: true
}));

// Create a proxy for the API server
const apiProxy = createProxyMiddleware('/api', {
  target: 'http://localhost:3000',
  changeOrigin: true,
  secure: false,
  logLevel: 'debug',
  onProxyReq: (proxyReq) => {
    proxyReq.setHeader('Host', 'localhost:3000');
  }
});

// Create a proxy for the Vite dev server
const viteProxy = createProxyMiddleware('/', {
  target: 'http://localhost:5173',
  changeOrigin: true,
  ws: true,
  secure: false,
  logLevel: 'debug',
  onProxyReq: (proxyReq) => {
    proxyReq.setHeader('Host', 'localhost:5173');
  },
  onError: (err, req, res) => {
    res.writeHead(500, {
      'Content-Type': 'text/html'
    });
    res.end(`
      <html>
        <body>
          <h2>Vite Dev Server Not Available</h2>
          <p>The Vite development server is not available. Please make sure it's running.</p>
          <p>If you're seeing this message, you might want to try:</p>
          <ul>
            <li>Using our fallback development server at <a href="http://localhost:8080">http://localhost:8080</a></li>
            <li>Using our API proxy at <a href="http://localhost:3333">http://localhost:3333</a></li>
          </ul>
        </body>
      </html>
    `);
  }
});

// Use API proxy for /api routes
app.use('/api', apiProxy);

// Use Vite proxy for all other routes
app.use(viteProxy);

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Proxy server running at http://0.0.0.0:${port}`);
  console.log(`Proxying API requests to http://localhost:3000`);
  console.log(`Proxying all other requests to http://localhost:5173`);
});