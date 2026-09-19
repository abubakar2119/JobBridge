-- migrations/009_add_indexes.sql

-- Public board: filters on status, orders by created_at DESC, id DESC
-- Leading column (status) handles the equality filter.
-- Remaining columns (created_at DESC, id DESC) match the ORDER BY exactly,
-- so PostgreSQL can serve the query with a single index scan in sort order.
CREATE INDEX idx_jobs_status_created
  ON jobs (status, created_at DESC, id DESC);

-- Company-scoped job queries (recruiter dashboard): filter by company_id
-- The public board join also benefits from this when looking up jobs by company
CREATE INDEX idx_jobs_company_id
  ON jobs (company_id);

-- Public board JOIN: filter companies by status
CREATE INDEX idx_companies_status
  ON companies (status);

-- Recruiter lookup: find which company a user belongs to
CREATE INDEX idx_recruiters_user_id
  ON recruiters (user_id);

-- Company member list: find all recruiters in a company
CREATE INDEX idx_recruiters_company_id
  ON recruiters (company_id);