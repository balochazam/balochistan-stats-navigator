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

// Simple session configuration
const PostgreSqlStore = ConnectPgSimple(session);

// Trust proxy for Replit deployment
app.set('trust proxy', 1);

app.use(session({
  store: new PostgreSqlStore({
    pool: pool,
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || 'bbos-secret-key-2025',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Keep simple - Replit handles SSL
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax', // Allow cookies during redirects
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

    const port = parseInt(process.env.PORT || '5000', 10);
    const host = '0.0.0.0';
    
    server.listen({ port, host, reusePort: true }, () => {
      log(`✓ Server started on ${host}:${port}`);
    });
  } catch (error) {
    console.error("Fatal error during server initialization:");
    console.error(error);
    process.exit(1);
  }
})();
