import express from "express";
import cors from "cors";
import session from "express-session";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { registerRoutes } from "./routes";
import { Server } from "http";

// Configuration types
interface ServerConfig {
  port: number;
  host: string;
  enableCors: boolean;
  enableAuth: boolean;
  trustProxy: boolean;
}

// Default configuration
const defaultConfig: ServerConfig = {
  port: Number(process.env.PORT) || 3000,
  host: process.env.HOST || "0.0.0.0",
  enableCors: true,
  enableAuth: true,
  trustProxy: true,
};

/**
 * Creates and configures an Express server with the specified options
 */
export function createServer(config: Partial<ServerConfig> = {}): { app: express.Express; server: Server } {
  // Merge provided config with defaults
  const fullConfig: ServerConfig = { ...defaultConfig, ...config };
  
  // Create Express app
  const app = express();
  
  // Setup middleware
  if (fullConfig.trustProxy) {
    app.set("trust proxy", 1);
  }
  
  if (fullConfig.enableCors) {
    app.use(cors({
      origin: '*',
      credentials: true,
    }));
  }
  
  // Add JSON and URL-encoded body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Set up authentication if enabled
  if (fullConfig.enableAuth) {
    setupAuth(app);
  }
  
  // Register API routes and get the HTTP server
  const server = registerRoutes(app);
  
  return { app, server };
}

/**
 * Starts the server with the given configuration
 */
export function startServer(
  config: Partial<ServerConfig> = {},
  callback?: () => void
): { app: express.Express; server: Server } {
  const { app, server } = createServer(config);
  const fullConfig: ServerConfig = { ...defaultConfig, ...config };
  
  // Start the server
  server.listen(fullConfig.port, fullConfig.host, () => {
    console.log(`Server listening at http://${fullConfig.host}:${fullConfig.port}`);
    
    // Call the callback if provided
    if (callback) {
      callback();
    }
  });
  
  return { app, server };
}

/**
 * Creates a session store based on the environment
 */
export function createSessionStore(type: 'memory' | 'database' = 'memory'): session.Store {
  // For this implementation, we always return the memory store
  // since we're not using a database in this project
  return storage.sessionStore;
}