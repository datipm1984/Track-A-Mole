import "dotenv/config";
import { neon } from "@neondatabase/serverless";
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is missing. Check the backend/.env file."
  );
}

export const sql = neon(connectionString);