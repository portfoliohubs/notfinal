-- Supporting indexes for the authenticated Worker API. This migration only
-- adds indexes and does not alter or remove existing production data.
CREATE INDEX IF NOT EXISTS idx_cases_uid_sort ON cases(uid, sort_order, created_at);
CREATE INDEX IF NOT EXISTS idx_blog_articles_published ON blog_articles(published_at);
CREATE INDEX IF NOT EXISTS idx_admins_email_lower ON admins(email);
