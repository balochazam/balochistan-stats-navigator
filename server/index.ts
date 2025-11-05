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

// Configure trust proxy if behind reverse proxy (nginx, Apache, etc.)
if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

app.use(session({
  store: new PostgreSqlStore({
    pool: pool,
    createTableIfMissing: true,
    tableName: process.env.SESSION_TABLE_NAME || 'session',
    ttl: parseInt(process.env.SESSION_TTL || '86400', 10), // 24 hours default
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  name: process.env.SESSION_COOKIE_NAME || 'connect.sid',
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: parseInt(process.env.SESSION_TTL || '86400', 10) * 1000,
    domain: process.env.SESSION_COOKIE_DOMAIN || undefined,
    sameSite: 'lax',
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
    const timeout = parseInt(process.env.SERVER_TIMEOUT || '60000', 10);
    server.setTimeout(timeout);

    // Use environment variables for port and host with sensible defaults
    const port = parseInt(process.env.PORT || '5000', 10);
    const host = process.env.HOST || '0.0.0.0';
    
    server.listen({
      port,
      host,
      reusePort: true,
    }, () => {
      log(`✓ Server successfully started`);
      log(`✓ Listening on: ${host}:${port}`);
      log(`✓ Environment: ${app.get("env")}`);
      log(`✓ Database: ${process.env.REMOTE_DATABASE_URL ? 'Remote PostgreSQL' : 'Local PostgreSQL'}`);
      log(`✓ Trust Proxy: ${process.env.TRUST_PROXY === 'true' ? 'enabled' : 'disabled'}`);
    });
  } catch (error) {
    console.error("Fatal error during server initialization:");
    console.error(error);
    process.exit(1);
  }
})();
