BEGIN;

-- Mock users. Passwords:
-- 0712222222 / alex1234
-- 0713333333 / ana1234
INSERT INTO users (
  first_name,
  last_name,
  cnp,
  phone,
  password_hash,
  is_admin,
  is_suspended,
  is_home,
  bt_code_hash,
  bt_code_epoch
) VALUES
  (
    'Alex',
    'Popescu',
    '1990202123456',
    '0712222222',
    '$2b$10$eQrU0QJdGmCJD54QxwRUtuxHOalZi.6C.8/z.5hi0qI5QVXDOArZi',
    false,
    false,
    true,
    null,
    null
  ),
  (
    'Ana',
    'Ionescu',
    '2990303123456',
    '0713333333',
    '$2b$10$GFF1Sd6LiCojTAnYjkSNLOil..4gGMPtFyBhZ430/ioW81dw1GE3K',
    false,
    false,
    false,
    null,
    null
  )
ON CONFLICT (phone) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  is_suspended = EXCLUDED.is_suspended,
  is_home = EXCLUDED.is_home;

INSERT INTO temperature_programs (name, schedule)
SELECT
  'Mock Comfort',
  '[{"days":[0,1,2,3,4,5,6],"slots":[{"time":"06:00","temp":22},{"time":"14:00","temp":21},{"time":"22:30","temp":19}]}]'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM temperature_programs WHERE name = 'Mock Comfort'
);

INSERT INTO temperature_programs (name, schedule)
SELECT
  'Mock Eco',
  '[{"days":[1,2,3,4,5],"slots":[{"time":"07:00","temp":20},{"time":"18:00","temp":21},{"time":"23:00","temp":"antifreeze"}]},{"days":[0,6],"slots":[{"time":"09:00","temp":21},{"time":"23:00","temp":18}]}]'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM temperature_programs WHERE name = 'Mock Eco'
);

INSERT INTO rooms (
  name,
  hardware_code,
  temp_program_id,
  is_heating,
  offset_value,
  current_temp
) VALUES
  (
    'Living ROOM1',
    'ROOM1',
    (SELECT id FROM temperature_programs WHERE name = 'Mock Comfort' LIMIT 1),
    true,
    0.00,
    22.40
  ),
  (
    'Dormitor ROOM2',
    'ROOM2',
    (SELECT id FROM temperature_programs WHERE name = 'Mock Eco' LIMIT 1),
    false,
    -0.20,
    20.10
  )
ON CONFLICT (hardware_code) DO UPDATE SET
  name = EXCLUDED.name,
  temp_program_id = EXCLUDED.temp_program_id,
  is_heating = EXCLUDED.is_heating,
  offset_value = EXCLUDED.offset_value,
  current_temp = EXCLUDED.current_temp;

INSERT INTO light_zones (room_id, name, is_on)
SELECT r.id, 'Lumina principala ' || r.hardware_code, true
FROM rooms r
WHERE r.hardware_code = 'ROOM1'
  AND NOT EXISTS (
    SELECT 1 FROM light_zones z
    WHERE z.room_id = r.id AND z.name = 'Lumina principala ROOM1'
  );

INSERT INTO light_zones (room_id, name, is_on)
SELECT r.id, 'Lumina principala ' || r.hardware_code, false
FROM rooms r
WHERE r.hardware_code = 'ROOM2'
  AND NOT EXISTS (
    SELECT 1 FROM light_zones z
    WHERE z.room_id = r.id AND z.name = 'Lumina principala ROOM2'
  );

INSERT INTO temperature_readings (room_id, value, humidity, occurred_at)
SELECT r.id, reading.value, reading.humidity, reading.occurred_at
FROM rooms r
JOIN (
  VALUES
    ('ROOM1', 21.80::decimal, 44.00::decimal, '2026-06-04 08:00:00'::timestamp),
    ('ROOM1', 22.10::decimal, 45.00::decimal, '2026-06-04 09:00:00'::timestamp),
    ('ROOM1', 22.40::decimal, 46.00::decimal, '2026-06-04 10:00:00'::timestamp),
    ('ROOM2', 19.70::decimal, 48.00::decimal, '2026-06-04 08:00:00'::timestamp),
    ('ROOM2', 19.90::decimal, 47.00::decimal, '2026-06-04 09:00:00'::timestamp),
    ('ROOM2', 20.10::decimal, 47.00::decimal, '2026-06-04 10:00:00'::timestamp)
) AS reading(room_code, value, humidity, occurred_at)
  ON reading.room_code = r.hardware_code
WHERE NOT EXISTS (
  SELECT 1 FROM temperature_readings existing
  WHERE existing.room_id = r.id
    AND existing.occurred_at = reading.occurred_at
);

INSERT INTO access_events (user_id, direction, occurred_at)
SELECT u.id, event.direction, event.occurred_at
FROM users u
JOIN (
  VALUES
    ('0712222222', 'in', '2026-06-04 07:55:00'::timestamp),
    ('0713333333', 'out', '2026-06-04 08:20:00'::timestamp),
    ('0712222222', 'out', '2026-06-04 12:15:00'::timestamp)
) AS event(phone, direction, occurred_at)
  ON event.phone = u.phone
WHERE NOT EXISTS (
  SELECT 1 FROM access_events existing
  WHERE existing.user_id = u.id
    AND existing.direction = event.direction
    AND existing.occurred_at = event.occurred_at
);

INSERT INTO light_events (zone_id, user_id, new_state, occurred_at)
SELECT z.id, u.id, event.new_state, event.occurred_at
FROM light_zones z
JOIN rooms r ON r.id = z.room_id
JOIN (
  VALUES
    ('ROOM1', '0712222222', true, '2026-06-04 08:10:00'::timestamp),
    ('ROOM2', '0713333333', false, '2026-06-04 08:30:00'::timestamp)
) AS event(room_code, phone, new_state, occurred_at)
  ON event.room_code = r.hardware_code
JOIN users u ON u.phone = event.phone
WHERE NOT EXISTS (
  SELECT 1 FROM light_events existing
  WHERE existing.zone_id = z.id
    AND existing.user_id = u.id
    AND existing.occurred_at = event.occurred_at
);

INSERT INTO boiler_events (new_state, occurred_at)
SELECT event.new_state, event.occurred_at
FROM (
  VALUES
    (true, '2026-06-04 07:50:00'::timestamp),
    (false, '2026-06-04 10:30:00'::timestamp)
) AS event(new_state, occurred_at)
WHERE NOT EXISTS (
  SELECT 1 FROM boiler_events existing
  WHERE existing.new_state = event.new_state
    AND existing.occurred_at = event.occurred_at
);

INSERT INTO devices (
  device_id,
  device_type,
  firmware_version,
  ip_address,
  is_online,
  device_token,
  last_seen_at
) VALUES (
  'ESP32_MAIN_GATEWAY',
  'gateway',
  'mock-firmware-0.1',
  '192.168.1.93',
  true,
  'dev-device-token',
  '2026-06-04 10:00:00'::timestamp
)
ON CONFLICT (device_id) DO UPDATE SET
  firmware_version = EXCLUDED.firmware_version,
  ip_address = EXCLUDED.ip_address,
  is_online = EXCLUDED.is_online,
  last_seen_at = EXCLUDED.last_seen_at;

COMMIT;
