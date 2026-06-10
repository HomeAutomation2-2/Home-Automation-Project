-- ============================================================
-- BlueLock — RESET complet date demo
-- ============================================================
-- Rulează ÎNAINTE de 99-populate.sql când vrei să reîncarci demo-ul.
--
--   docker exec -i home_automation_db psql -U postgres -d home_automation -f /docker-entrypoint-initdb.d/02-demo-reset.sql
--
-- Sau local:
--   psql -U postgres -d home_automation -f COD/DATABASES/init-scripts/02-demo-reset.sql
-- ============================================================

TRUNCATE TABLE
    notifications,
    auth_sessions,
    temperature_readings,
    access_events,
    light_events,
    boiler_events,
    light_zones,
    rooms,
    temperature_programs,
    home_settings,
    devices,
    users
RESTART IDENTITY CASCADE;

DO $$ BEGIN
  RAISE NOTICE 'Toate tabelele demo au fost golite. Rulează 99-populate.sql pentru date noi.';
END $$;
