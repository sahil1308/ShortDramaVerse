import express from "express";
import { createServer as createViteServer } from "vite";
import { registerRoutes } from "./routes";
import { Server } from "http";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine if we're in production mode
const isProduction = process.env.NODE_ENV === "production";

async function setupVite(app: express.Express, httpServer: Server) {
  if (isProduction) {
    console.log("Running in production mode, serving static files");
    // Serve static files from the dist/client directory
    const clientDistPath = path.resolve(__dirname, "../client");
    console.log(`Serving static files from: ${clientDistPath}`);
    app.use(express.static(clientDistPath));
    
    // For any route not matching an API route, serve the index.html file
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) {
        return next();
      }
      const indexPath = path.join(clientDistPath, "index.html");
      console.log(`Serving index.html from: ${indexPath}`);
      res.sendFile(indexPath);
    });
    
    return null;
  } else {
    console.log("Running in development mode with Vite middleware");
    // Create Vite server in middleware mode for development
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
          clientPort: 443,
        },
        host: true, // Allow all hosts
        cors: true,
        strictPort: false,
        fs: {
          strict: false,
          allow: ['.']
        },
      },
      appType: "spa",
      clearScreen: false,
      optimizeDeps: {
        force: true
      },
    });

    // Use Vite's connect instance as middleware
    app.use(vite.middlewares);

    return vite;
  }
}

async function main() {
  const app = express();
  const port = process.env.PORT || 3000;
  const workflowPort = 5000; // Port expected by the workflow

  // Enable CORS for all origins
  app.use(cors({
    origin: '*',
    credentials: true
  }));

  // Middleware for parsing JSON and URL-encoded data
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Register API routes
  const httpServer = registerRoutes(app);

  // Set up server based on environment (dev with Vite or prod with static files)
  await setupVite(app, httpServer);

  // Start the server on the defined port
  const host = process.env.HOST || "0.0.0.0";
  httpServer.listen(Number(port), host, () => {
    console.log(`Server listening at http://${host}:${port} in ${isProduction ? "production" : "development"} mode`);
  });

  // Also listen on workflow port (5000) for compatibility
  if (!isProduction) {
    const workflowServer = express();
    workflowServer.use(cors({
      origin: '*',
      credentials: true
    }));
    workflowServer.get('*', (req, res) => {
      // Use the same protocol that the request came in with
      const protocol = req.headers['x-forwarded-proto'] || 'http';
      res.redirect(`${protocol}://${req.hostname}:${port}${req.url}`);
    });
    workflowServer.listen(workflowPort, "0.0.0.0", () => {
      console.log(`Workflow port listening on ${workflowPort} (redirecting to ${port})`);
    });
  }
}

main().catch((error) => {
  console.error("Error starting server:", error);
  process.exit(1);
});