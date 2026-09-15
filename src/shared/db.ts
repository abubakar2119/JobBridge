// src/shared/db.ts
import pkg from 'pg';
const { Pool } = pkg;
import { config } from './config.js';

export function createDbClient(connectionString: string): Pool {
  return new Pool({
    connectionString,
  });
}

export const db = createDbClient(config.DATABASE_URL);