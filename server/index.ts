import express from "express";
import { createServer as createViteServer } from "vite";
import { registerRoutes } from "./routes";
import { Server } from "http";
import cors from "cors";

async function setupVite(app: express.Express, httpServer: Server) {
  // Create Vite server in middleware mode
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

  // Set up development server with Vite for the frontend
  await setupVite(app, httpServer);

  // Start the server on the defined port
  const host = process.env.HOST || "0.0.0.0";
  httpServer.listen(Number(port), host, () => {
    console.log(`Server listening at http://${host}:${port}`);
  });

  // Also listen on workflow port (5000) for compatibility
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

main().catch((error) => {
  console.error("Error starting server:", error);
  process.exit(1);
});