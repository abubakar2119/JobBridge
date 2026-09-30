import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE jobs
      ADD COLUMN IF NOT EXISTS search_vector tsvector;

    UPDATE jobs
    SET search_vector = to_tsvector(
      'pg_catalog.english',
      coalesce(title, '') || ' ' || coalesce(description, '')
    );

    CREATE INDEX IF NOT EXISTS idx_jobs_search
      ON jobs USING gin(search_vector);

    CREATE OR REPLACE FUNCTION jobs_search_vector_update()
    RETURNS trigger AS $$
    BEGIN
      NEW.search_vector :=
        to_tsvector(
          'pg_catalog.english',
          coalesce(NEW.title, '') || ' ' || coalesce(NEW.description, '')
        );
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS jobs_search_vector_update ON jobs;

    CREATE TRIGGER jobs_search_vector_update
      BEFORE INSERT OR UPDATE ON jobs
      FOR EACH ROW
      EXECUTE FUNCTION jobs_search_vector_update();
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP TRIGGER IF EXISTS jobs_search_vector_update ON jobs;
    DROP FUNCTION IF EXISTS jobs_search_vector_update();
    DROP INDEX IF EXISTS idx_jobs_search;
    ALTER TABLE jobs DROP COLUMN IF EXISTS search_vector;
  `);
}
