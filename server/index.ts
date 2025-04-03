import express from "express";
import { createServer as createViteServer } from "vite";
import { registerRoutes } from "./routes";
import { Server } from "http";

async function setupVite(app: express.Express, httpServer: Server) {
  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: {
        server: httpServer,
      },
    },
    appType: "spa",
  });

  // Use Vite's connect instance as middleware
  app.use(vite.middlewares);

  return vite;
}

async function main() {
  const app = express();
  const port = process.env.PORT || 3000;
  const workflowPort = 5000; // Port expected by the workflow

  // Middleware for parsing JSON and URL-encoded data
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Register API routes
  const httpServer = registerRoutes(app);

  // Set up development server with Vite for the frontend
  await setupVite(app, httpServer);

  // Start the server on the defined port
  httpServer.listen(Number(port), "0.0.0.0", () => {
    console.log(`Server listening on port ${port}`);
  });

  // Also listen on workflow port (5000) for compatibility
  const workflowServer = express();
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