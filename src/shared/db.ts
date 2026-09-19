// src/shared/db.ts

import pkg from 'pg';
import { config } from './config.js';

const { Pool } = pkg;

// In src/shared/db.ts — add around the pool.query call:
let _queryCount = 0;
export function resetQueryCount() { _queryCount = 0; }
export function getQueryCount() { return _queryCount; }

// In the existing query function, increment before calling pool.query:
_queryCount++;

export function createDbClient(connectionString: string) {
  return new Pool({
    connectionString,
  });
}

export const db = createDbClient(config.DATABASE_URL);