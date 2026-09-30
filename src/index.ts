import { pool } from './shared/db.js';
import { redis } from './shared/redis.js';
import logger from './shared/logger.js';
import { app } from './app.js';
import { config } from './shared/config.js';

const server = app.listen(config.PORT, () => {
  logger.info({ port: config.PORT }, 'API server started');
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received — starting graceful shutdown');

  // Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed — cleaning up');

    try {
      await pool.end();
      logger.info('DB pool closed');
    } catch (err) {
      logger.error({ err }, 'Error closing DB pool');
    }

    try {
      await redis.quit();
      logger.info('Redis connection closed');
    } catch (err) {
      logger.error({ err }, 'Error closing Redis');
    }

    logger.info('Graceful shutdown complete');
    process.exit(0);
  });

  // Force exit after 5 seconds if requests are still in flight
  setTimeout(() => {
    logger.error('Graceful shutdown timeout — forcing exit');
    process.exit(1);
  }, 5000);
});