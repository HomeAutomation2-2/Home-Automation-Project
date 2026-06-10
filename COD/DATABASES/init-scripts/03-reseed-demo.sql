-- ============================================================
-- BlueLock — RESEED într-o singură comandă (reset + populare)
-- Rulează din folderul init-scripts (cwd important pentru \ir):
--
--   cd COD/DATABASES/init-scripts
--   psql -U postgres -d home_automation -f 03-reseed-demo.sql
--
-- Docker:
--   docker exec -i home_automation_db psql -U postgres -d home_automation -f /docker-entrypoint-initdb.d/03-reseed-demo.sql
-- ============================================================

\ir 02-demo-reset.sql
\ir 99-populate.sql
