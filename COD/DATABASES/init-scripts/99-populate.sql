-- ============================================================
-- BlueLock — POPULARE DEMO (date „reale”, fără ESP)
-- ============================================================
-- Parolă pentru TOȚI utilizatorii: password
--
-- REÎNCĂRCARE (DB existentă):
--   psql -U postgres -d home_automation -f init-scripts/02-demo-reset.sql
--   psql -U postgres -d home_automation -f init-scripts/99-populate.sql
--
-- Docker (container pornit):
--   docker exec -i home_automation_db psql -U postgres -d home_automation -f /docker-entrypoint-initdb.d/02-demo-reset.sql
--   docker exec -i home_automation_db psql -U postgres -d home_automation -f /docker-entrypoint-initdb.d/99-populate.sql
--
-- Prima pornire Docker: rulează automat dacă users e gol.
-- ============================================================

DO $$
DECLARE
  pwd CONSTANT VARCHAR(255) := '$2b$10$mfdO0ISDDb8ekf0i2JuAQOwZhQlxMUU80JS5cQzCCfd8XcL44iodi';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users LIMIT 1) THEN

    -- ── Utilizatori ──────────────────────────────────────────
    -- Alex = admin | Marc & Sebi = copii | Sebi = întoarcere după 00:00
    -- Marc = a ieșit din casă târziu (23:42) | Serban = suspendat
    INSERT INTO users
        (id, first_name, last_name, cnp, phone, password_hash,
         is_admin, is_suspended, is_home, is_child, allow_return_after_midnight,
         bt_code_hash, bt_code_epoch, created_at)
    VALUES
        (1, 'Alex',  'Marinescu', '5010101123456', '0700000001', pwd, true,  false, true,  false, false, NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '180 days'),
        (2, 'Ana',   'Popescu',   '6020202234567', '0700000002', pwd, false, false, true,  false, false, NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '150 days'),
        (3, 'Marc',  'Ionescu',   '7030303345678', '0700000003', pwd, false, false, false, true,  false, NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '120 days'),
        (4, 'Sebi',  'Ionescu',   '8040404456789', '0700000004', pwd, false, false, true,  true,  false, NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '120 days'),
        (5, 'Cucea', 'Marin',     '9050505567890', '0700000005', pwd, false, false, false, false, false, NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '90 days'),
        (6, 'Serban','Dumitru',   '1060606678901', '0700000006', pwd, false, true,  false, false, false, NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '60 days');
    PERFORM setval('users_id_seq', 6);

    -- ── Programe temperatură ─────────────────────────────────
    INSERT INTO temperature_programs (id, name, schedule) VALUES
        (1, 'Zi lucrătoare',
         '[{"days":[1,2,3,4,5],"slots":[{"time":"06:30","temp":21},{"time":"08:30","temp":20},{"time":"17:00","temp":22},{"time":"22:30","temp":"antifreeze"}]},
           {"days":[6,7],"slots":[{"time":"08:00","temp":22},{"time":"23:30","temp":"antifreeze"}]}]'),
        (2, 'Noapte confort',
         '[{"days":[1,2,3,4,5,6,7],"slots":[{"time":"00:00","temp":19},{"time":"07:00","temp":"off"},{"time":"21:30","temp":19}]}]'),
        (3, 'Copii — seară',
         '[{"days":[1,2,3,4,5,6,7],"slots":[{"time":"00:00","temp":18},{"time":"15:00","temp":21},{"time":"21:00","temp":18}]}]'),
        (4, 'Absență',
         '[{"days":[1,2,3,4,5,6,7],"slots":[{"time":"00:00","temp":"antifreeze"}]}]'),
        (5, 'Oprit',
         '[{"days":[1,2,3,4,5,6,7],"slots":[{"time":"00:00","temp":"off"}]}]');
    PERFORM setval('temperature_programs_id_seq', 5);

    -- ── Camere ───────────────────────────────────────────────
    INSERT INTO rooms (id, name, temp_program_id, is_heating, offset_value, current_temp) VALUES
        (1, 'Living',            1, false,  0.00, 22.40),
        (2, 'Dormitor părinți',  2, false, -0.30, 20.80),
        (3, 'Dormitor copii',    3, true,   0.20, 21.10),
        (4, 'Bucătărie',         1, false,  0.50, 23.60),
        (5, 'Hol & intrare',     5, false,  0.00, 19.20);
    PERFORM setval('rooms_id_seq', 5);

    -- ── Zone lumină ──────────────────────────────────────────
    INSERT INTO light_zones (id, room_id, name, is_on, last_changed_at) VALUES
        (1, 1, 'Plafon living',       true,  CURRENT_TIMESTAMP - INTERVAL '45 minutes'),
        (2, 1, 'Bandă TV',            true,  CURRENT_TIMESTAMP - INTERVAL '45 minutes'),
        (3, 2, 'Veioză dormitor',     false, CURRENT_TIMESTAMP - INTERVAL '8 hours'),
        (4, 3, 'Plafon copii',        false, CURRENT_TIMESTAMP - INTERVAL '6 hours'),
        (5, 3, 'Noptieră Sebi',       false, CURRENT_TIMESTAMP - INTERVAL '7 hours'),
        (6, 4, 'Spoturi bucătărie',   false, CURRENT_TIMESTAMP - INTERVAL '3 hours'),
        (7, 5, 'Lumină intrare',      true,  CURRENT_TIMESTAMP - INTERVAL '20 minutes'),
        (8, 5, 'Coridor',             false, CURRENT_TIMESTAMP - INTERVAL '2 hours');
    PERFORM setval('light_zones_id_seq', 8);

    -- ── Setări casă ──────────────────────────────────────────
    INSERT INTO home_settings (id, hysteresis, antifreeze_temp, sampling_period, boiler_state, fire_alert_celsius)
    VALUES (1, 0.50, 7.00, 60, false, 45.00);

    -- ── Citiri temperatură (ultimele 7 zile, la fiecare oră) ─
    INSERT INTO temperature_readings (loop_id, value, occured_at)
    SELECT
        r.id,
        ROUND(
            (CASE r.id
                WHEN 1 THEN 22.0
                WHEN 2 THEN 20.5
                WHEN 3 THEN 21.0
                WHEN 4 THEN 23.0
                WHEN 5 THEN 19.0
            END
            + 1.2 * SIN(EXTRACT(HOUR FROM ts.ts)::numeric / 24 * 2 * PI())
            + 0.3 * SIN(EXTRACT(DOW FROM ts.ts)::numeric)
            + (random() * 0.6 - 0.3))::numeric,
            2
        ),
        ts.ts
    FROM rooms r
    CROSS JOIN generate_series(
        date_trunc('hour', CURRENT_TIMESTAMP - INTERVAL '7 days'),
        date_trunc('hour', CURRENT_TIMESTAMP),
        INTERVAL '1 hour'
    ) AS ts(ts);

    -- ── Evenimente acces (ultimele ~14 zile) ─────────────────
    INSERT INTO access_events (user_id, direction, occurred_at) VALUES
        -- Alex — rutină birou
        (1, 'out', (date_trunc('day', CURRENT_TIMESTAMP - INTERVAL '14 days') + TIME '07:55')),
        (1, 'in',  (date_trunc('day', CURRENT_TIMESTAMP - INTERVAL '14 days') + TIME '18:40')),
        (1, 'out', (date_trunc('day', CURRENT_TIMESTAMP - INTERVAL '7 days')  + TIME '08:05')),
        (1, 'in',  (date_trunc('day', CURRENT_TIMESTAMP - INTERVAL '7 days')  + TIME '19:10')),
        (1, 'out', (date_trunc('day', CURRENT_TIMESTAMP - INTERVAL '1 day')   + TIME '08:00')),
        (1, 'in',  (date_trunc('day', CURRENT_TIMESTAMP - INTERVAL '1 day')   + TIME '18:30')),
        (1, 'out', CURRENT_TIMESTAMP - INTERVAL '8 hours'),
        (1, 'in',  CURRENT_TIMESTAMP - INTERVAL '2 hours'),

        -- Ana
        (2, 'out', (date_trunc('day', CURRENT_TIMESTAMP - INTERVAL '3 days') + TIME '09:15')),
        (2, 'in',  (date_trunc('day', CURRENT_TIMESTAMP - INTERVAL '3 days') + TIME '17:45')),
        (2, 'out', (date_trunc('day', CURRENT_TIMESTAMP - INTERVAL '1 day')  + TIME '08:20')),
        (2, 'in',  (date_trunc('day', CURRENT_TIMESTAMP - INTERVAL '1 day')  + TIME '17:50')),
        (2, 'out', CURRENT_TIMESTAMP - INTERVAL '10 hours'),
        (2, 'in',  CURRENT_TIMESTAMP - INTERVAL '4 hours'),

        -- Marc (copil) — ieșire târzie ieri la 23:42
        (3, 'out', (date_trunc('day', CURRENT_TIMESTAMP - INTERVAL '2 days') + TIME '07:35')),
        (3, 'in',  (date_trunc('day', CURRENT_TIMESTAMP - INTERVAL '2 days') + TIME '14:10')),
        (3, 'out', (date_trunc('day', CURRENT_TIMESTAMP - INTERVAL '2 days') + TIME '16:00')),
        (3, 'in',  (date_trunc('day', CURRENT_TIMESTAMP - INTERVAL '2 days') + TIME '22:50')),
        (3, 'out', (date_trunc('day', CURRENT_TIMESTAMP - INTERVAL '1 day')  + TIME '07:40')),
        (3, 'in',  (date_trunc('day', CURRENT_TIMESTAMP - INTERVAL '1 day')  + TIME '14:05')),
        (3, 'out', (date_trunc('day', CURRENT_TIMESTAMP - INTERVAL '1 day')  + TIME '23:42')),

        -- Sebi (copil) — întoarcere după miezul nopții la 01:28
        (4, 'out', (date_trunc('day', CURRENT_TIMESTAMP - INTERVAL '2 days') + TIME '08:05')),
        (4, 'in',  (date_trunc('day', CURRENT_TIMESTAMP - INTERVAL '2 days') + TIME '14:00')),
        (4, 'out', (date_trunc('day', CURRENT_TIMESTAMP - INTERVAL '1 day')  + TIME '19:10')),
        (4, 'in',  (date_trunc('day', CURRENT_TIMESTAMP) + TIME '01:28')),

        -- Cucea — plecat la prieteni
        (5, 'out', (date_trunc('day', CURRENT_TIMESTAMP - INTERVAL '4 days') + TIME '10:00')),
        (5, 'in',  (date_trunc('day', CURRENT_TIMESTAMP - INTERVAL '4 days') + TIME '23:00')),
        (5, 'out', CURRENT_TIMESTAMP - INTERVAL '6 hours'),

        -- Serban — suspendat, istoric vechi
        (6, 'in',  (date_trunc('day', CURRENT_TIMESTAMP - INTERVAL '20 days') + TIME '12:00')),
        (6, 'out', (date_trunc('day', CURRENT_TIMESTAMP - INTERVAL '20 days') + TIME '18:00'));

    -- ── Evenimente lumină ─────────────────────────────────────
    INSERT INTO light_events (zone_id, user_id, new_state, occurred_at) VALUES
        (1, 2, true,  CURRENT_TIMESTAMP - INTERVAL '45 minutes'),
        (2, 2, true,  CURRENT_TIMESTAMP - INTERVAL '45 minutes'),
        (7, 1, true,  CURRENT_TIMESTAMP - INTERVAL '20 minutes'),
        (3, 2, false, CURRENT_TIMESTAMP - INTERVAL '8 hours'),
        (4, 4, false, CURRENT_TIMESTAMP - INTERVAL '6 hours'),
        (6, 1, false, CURRENT_TIMESTAMP - INTERVAL '3 hours'),
        (1, 1, true,  (date_trunc('day', CURRENT_TIMESTAMP - INTERVAL '2 days') + TIME '19:30')),
        (1, 1, false, (date_trunc('day', CURRENT_TIMESTAMP - INTERVAL '2 days') + TIME '23:15')),
        (4, 3, true,  (date_trunc('day', CURRENT_TIMESTAMP - INTERVAL '3 days') + TIME '20:00')),
        (4, 3, false, (date_trunc('day', CURRENT_TIMESTAMP - INTERVAL '3 days') + TIME '22:45'));

    -- ── Centrală termică ─────────────────────────────────────
    INSERT INTO boiler_events (new_state, occurred_at) VALUES
        (true,  (date_trunc('day', CURRENT_TIMESTAMP - INTERVAL '6 days') + TIME '05:45')),
        (false, (date_trunc('day', CURRENT_TIMESTAMP - INTERVAL '6 days') + TIME '09:30')),
        (true,  (date_trunc('day', CURRENT_TIMESTAMP - INTERVAL '3 days') + TIME '06:00')),
        (false, (date_trunc('day', CURRENT_TIMESTAMP - INTERVAL '3 days') + TIME '10:00')),
        (true,  (date_trunc('day', CURRENT_TIMESTAMP - INTERVAL '1 day')  + TIME '05:50')),
        (false, (date_trunc('day', CURRENT_TIMESTAMP - INTERVAL '1 day')  + TIME '09:15')),
        (true,  CURRENT_TIMESTAMP - INTERVAL '5 hours'),
        (false, CURRENT_TIMESTAMP - INTERVAL '2 hours');

    -- ── Notificări admin ─────────────────────────────────────
    INSERT INTO notifications (type, severity, title, message, related_user_id, related_room_id, is_read, created_at) VALUES
        ('child_late_return', 'warning', 'Întoarcere după miezul nopții',
         'Sebi Ionescu a intrat acasă la 01:28.', 4, NULL, false, CURRENT_TIMESTAMP - INTERVAL '5 hours'),
        ('child_late_return', 'warning', 'Întoarcere după miezul nopții',
         'Sebi Ionescu a intrat acasă la 02:05.', 4, NULL, true, CURRENT_TIMESTAMP - INTERVAL '4 days'),
        ('temperature_critical', 'critical', 'Temperatură critică',
         'Camera Bucătărie raportează 46.2°C (prag: 45.0°C).', NULL, 4, true, CURRENT_TIMESTAMP - INTERVAL '12 days');

    RAISE NOTICE 'Seed demo BlueLock aplicat — 6 utilizatori, 5 camere, 7 zile de istoric.';
  ELSE
    RAISE NOTICE 'Baza are deja date. Pentru reîncărcare rulează mai întâi 02-demo-reset.sql';
  END IF;
END $$;

-- ============================================================
-- CONTURI (parolă: password)
-- ============================================================
--  Alex Marinescu  — ADMIN, acasă     | 0700000001
--  Ana Popescu     — acasă            | 0700000002
--  Marc Ionescu    — COPIL, plecat    | 0700000003  (ieșire târzie ~23:42)
--  Sebi Ionescu    — COPIL, acasă     | 0700000004  (întoarcere 01:28 → notificare)
--  Cucea Marin     — plecat           | 0700000005
--  Serban Dumitru  — SUSPENDAT        | 0700000006
--
-- Camere: Living, Dormitor părinți, Dormitor copii, Bucătărie, Hol
-- Istoric: ~7 zile temperaturi (orar), ~14 zile acces, evenimente lumină & centrală
-- ESP: neînregistrat (simulezi starea fără hardware)
-- ============================================================
