// src/shared/db.ts

import pkg from 'pg';
import { config } from './config.js';

const { Pool } = pkg;

// Query counter
let _queryCount = 0;

export function resetQueryCount() {
  _queryCount = 0;
}

export function getQueryCount() {
  return _queryCount;
}

// Create database pool
export function createDbClient(connectionString: string) {
  return new Pool({
    connectionString,
  });
}

// Main database pool
export const pool = createDbClient(config.DATABASE_URL);

// Normal db.query with query counter
export const db = {
  query: (...args: Parameters<typeof pool.query>) => {
    _queryCount++;
    return pool.query(...args);
  },
};

export default db;