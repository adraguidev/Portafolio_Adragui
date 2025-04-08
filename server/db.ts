import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg"; // 👈 CommonJS compat
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set.");
}

const { Pool } = pkg; // 👈 así accedemos correctamente

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Heroku requiere esto
  },
});

export const db = drizzle(pool, { schema });
