-- Heating API extensions (PATCH rooms, override table)
ALTER TABLE rooms
  ADD COLUMN IF NOT EXISTS sampling_minutes INT NOT NULL DEFAULT 5;

CREATE TABLE IF NOT EXISTS heating_overrides (
    id               SERIAL PRIMARY KEY,
    program_id       INT NOT NULL REFERENCES temperature_programs(id) ON DELETE CASCADE,
    duration_minutes INT,
    expires_at       TIMESTAMP,
    is_active        BOOLEAN NOT NULL DEFAULT true,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS IX_heating_overrides_active
  ON heating_overrides (is_active, expires_at);
