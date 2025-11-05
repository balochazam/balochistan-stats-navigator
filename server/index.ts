import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";
import ConnectPgSimple from "connect-pg-simple";
import { pool } from "./db.js";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure PostgreSQL session store
const PostgreSqlStore = ConnectPgSimple(session);

app.use(session({
  store: new PostgreSqlStore({
    pool: pool,
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const pathReq = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (pathReq.startsWith("/api")) {
      let logLine = `${req.method} ${pathReq} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    log("Starting server initialization...");
    
    // Verify required environment variables
    if (!process.env.SESSION_SECRET) {
      log("WARNING: SESSION_SECRET not set, using fallback (not recommended for production)");
    }
    
    if (!process.env.REMOTE_DATABASE_URL && !process.env.DATABASE_URL) {
      throw new Error("Database connection not configured. Set REMOTE_DATABASE_URL or DATABASE_URL environment variable.");
    }
    
    log("Registering routes...");
    const server = await registerRoutes(app);

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      log(`Error: ${status} - ${message}`);
      res.status(status).json({ message });
      // removed throw err to prevent crashing
    });

    // Development / Vite
    if (app.get("env") === "development") {
      log("Setting up Vite development server...");
      await setupVite(app, server);
    } else {
      log("Setting up static file serving for production...");
      serveStatic(app);
    }

    // Prevent hanging connections
    server.setTimeout(60000); // 60s

    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`✓ Server successfully started on port ${port}`);
      log(`✓ Environment: ${app.get("env")}`);
      log(`✓ Database connected: ${process.env.REMOTE_DATABASE_URL ? 'Remote PostgreSQL (Aiven)' : 'Local PostgreSQL'}`);
    });
  } catch (error) {
    console.error("Fatal error during server initialization:");
    console.error(error);
    process.exit(1);
  }
})();
