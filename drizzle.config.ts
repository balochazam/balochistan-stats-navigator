import { defineConfig } from "drizzle-kit";

// Allow either DATABASE_URL or REMOTE_DATABASE_URL for flexibility
const databaseUrl = process.env.REMOTE_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("ERROR: Database URL not configured.");
  console.error("Please set one of the following environment variables:");
  console.error("  - DATABASE_URL (for local/Replit database)");
  console.error("  - REMOTE_DATABASE_URL (for external database)");
  process.exit(1);
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
