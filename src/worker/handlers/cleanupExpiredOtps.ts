import db from '../../shared/db.js';

// Delete OTP rows that have passed their expiry time
export async function cleanupExpiredOtps(): Promise<void> {
  const result = await db.query(
    `DELETE FROM email_verifications WHERE expires_at < NOW()`
  );
  console.log(`[cleanup] Deleted ${result.rowCount} expired OTP rows`);
}