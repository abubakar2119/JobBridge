import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE INDEX IF NOT EXISTS idx_jobs_status_created
      ON jobs (status, created_at DESC, id DESC);

    CREATE INDEX IF NOT EXISTS idx_jobs_company_id
      ON jobs (company_id);

    

    CREATE INDEX IF NOT EXISTS idx_recruiters_user_id
      ON recruiters (user_id);

    CREATE INDEX IF NOT EXISTS idx_recruiters_company_id
      ON recruiters (company_id);
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP INDEX IF EXISTS idx_jobs_status_created;
    DROP INDEX IF EXISTS idx_jobs_company_id;
    DROP INDEX IF EXISTS idx_recruiters_user_id;
    DROP INDEX IF EXISTS idx_recruiters_company_id;
  `);
}
