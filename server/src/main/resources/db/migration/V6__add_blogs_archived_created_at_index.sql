CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_archived_created_at ON blogs (archived, created_at);
