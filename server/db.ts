import dotenv from 'dotenv';
dotenv.config({ override: true });

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import fs from 'fs';

const AIVEN_FALLBACK_URL = 'postgres://avnadmin:AVNS_VDsa_x3fCM-vlgPZpbX@pg-22e1d53b-syedazambaloch-be27.d.aivencloud.com:14517/bbos';

const rawUrl = process.env.REMOTE_DATABASE_URL || process.env.DATABASE_URL;
const databaseUrl = (rawUrl && !rawUrl.includes('host:port') && !rawUrl.includes('username:password')) 
  ? rawUrl 
  : AIVEN_FALLBACK_URL;

export let isDbConfigured = false;
let poolInstance: Pool | null = null;

if (databaseUrl && !databaseUrl.includes('host:port') && !databaseUrl.includes('username:password')) {
  try {
    let cleanConnectionUrl = databaseUrl;
    let sslConfig: any = { rejectUnauthorized: false };

    try {
      const url = new URL(databaseUrl);
      // Remove sslmode query param so pg connection string parser does not enforce rejectUnauthorized: true
      url.searchParams.delete('sslmode');
      cleanConnectionUrl = url.toString();

      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        if (process.env.DB_SSL !== 'true') {
          sslConfig = false;
        }
      }
    } catch {
      // URL parsing failed
    }

    if (process.env.DB_SSL === 'false') {
      sslConfig = false;
    } else if (process.env.DB_SSL_CA_PATH) {
      try {
        sslConfig = {
          ca: fs.readFileSync(process.env.DB_SSL_CA_PATH, 'utf-8'),
          rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
        };
      } catch (error) {
        console.error(`Failed to read SSL CA certificate:`, error);
      }
    }

    poolInstance = new Pool({
      connectionString: cleanConnectionUrl,
      ssl: sslConfig,
      max: parseInt(process.env.DB_POOL_MAX || '10', 10),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000', 10),
    });

    isDbConfigured = true;
    console.log('[DB] Configured PostgreSQL pool with SSL.');
  } catch (err) {
    console.warn('[DB] Failed to initialize PostgreSQL pool:', err);
    isDbConfigured = false;
  }
} else {
  console.warn('[DB] No valid DATABASE_URL provided. Operating with in-memory storage.');
}

// Fallback dummy pool to satisfy types and prevent null reference exceptions
export const pool = poolInstance || new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/fallback',
});

// Avoid unhandled rejection on fallback pool
pool.on('error', (err) => {
  console.warn('[DB Pool Warning]', err.message);
});

let drizzleDb: any;
try {
  drizzleDb = drizzle(pool, { schema });
} catch (e) {
  console.warn('[DB] Drizzle initialization fallback active:', e);
  const noOp = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (d: any) => d?.data ?? {},
    update: async (d: any) => d?.data ?? {},
    delete: async () => ({}),
  };
  drizzleDb = new Proxy({}, {
    get: (_, prop) => (prop === 'query' ? new Proxy({}, { get: () => noOp }) : async () => []),
  });
}

export const db = drizzleDb;
