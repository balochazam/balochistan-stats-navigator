import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import fs from 'fs';

const databaseUrl = process.env.REMOTE_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "REMOTE_DATABASE_URL or DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure SSL based on environment
// Default to SSL enabled for remote databases (secure by default)
let sslConfig: any = { rejectUnauthorized: false };

// Parse connection string to check for sslmode
const url = new URL(databaseUrl);
const sslMode = url.searchParams.get('sslmode');

// If sslmode is in connection string, respect it
if (sslMode === 'require' || sslMode === 'verify-ca' || sslMode === 'verify-full') {
  sslConfig = { rejectUnauthorized: sslMode !== 'require' };
} else if (sslMode === 'disable') {
  sslConfig = false;
}

// Environment variable can override (explicit disable or enable)
if (process.env.DB_SSL === 'false') {
  sslConfig = false;
} else if (process.env.DB_SSL === 'true') {
  sslConfig = {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
  };
  
  // Support custom CA certificate for self-signed or internal CAs
  if (process.env.DB_SSL_CA_PATH) {
    try {
      sslConfig.ca = fs.readFileSync(process.env.DB_SSL_CA_PATH, 'utf-8');
    } catch (error) {
      console.error(`Failed to read SSL CA certificate from ${process.env.DB_SSL_CA_PATH}:`, error);
      throw error;
    }
  }
}

// For local databases (localhost), disable SSL by default unless explicitly enabled
if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
  if (process.env.DB_SSL !== 'true') {
    sslConfig = false;
  }
}

export const pool = new Pool({ 
  connectionString: databaseUrl,
  ssl: sslConfig,
  max: parseInt(process.env.DB_POOL_MAX || '20', 10),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000', 10),
});

export const db = drizzle(pool, { schema });
