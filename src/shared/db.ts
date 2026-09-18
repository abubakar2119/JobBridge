// src/shared/db.ts

import pkg from 'pg';
import { config } from './config.js';

const { Pool } = pkg;

export function createDbClient(connectionString: string) {
  return new Pool({
    connectionString,
  });
}

export const db = createDbClient(config.DATABASE_URL);