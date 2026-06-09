-- last_changed_at trebuie timestamptz pentru ore corecte în UI (fus orar RO).
ALTER TABLE light_zones
  ALTER COLUMN last_changed_at TYPE TIMESTAMPTZ
  USING last_changed_at AT TIME ZONE 'UTC';
