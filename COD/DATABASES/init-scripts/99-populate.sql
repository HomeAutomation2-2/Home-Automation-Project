DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users LIMIT 1) THEN
  
    -- Users
    INSERT INTO users
        (id, first_name, last_name, cnp, phone, password_hash, is_admin, is_suspended, is_home, bt_code_hash, bt_code_epoch)
    VALUES
        (1, 'John', 'Doe', '1234567890123', '1234567890', '$2b$10$mfdO0ISDDb8ekf0i2JuAQOwZhQlxMUU80JS5cQzCCfd8XcL44iodi', true,  false, true,  NULL, NULL),
        (2, 'Jane', 'Doe', '1234567890124', '1234567891', '$2b$10$mfdO0ISDDb8ekf0i2JuAQOwZhQlxMUU80JS5cQzCCfd8XcL44iodi', false, false, false, NULL, NULL),
        (3, 'Dani', 'Tes', '1234567890125', '1234567892', '$2b$10$mfdO0ISDDb8ekf0i2JuAQOwZhQlxMUU80JS5cQzCCfd8XcL44iodi', false, true, false, NULL, NULL);
    PERFORM setval('users_id_seq', 3);


    -- Temperature programs
    INSERT INTO temperature_programs (id, name, schedule)
    VALUES
        (1, 'Day',
         '[
           {"days":[1,2,3,4,5],"slots":[{"time":"07:00","temp":22},{"time":"22:00","temp":"antifreeze"}]},
           {"days":[6,7],      "slots":[{"time":"08:00","temp":22},{"time":"23:00","temp":"antifreeze"}]}
         ]'
        ),
        (2, 'Night',
         '[
           {"days":[1,2,3,4,5,6,7],"slots":[{"time":"00:00","temp":18},{"time":"08:00","temp":"off"},{"time":"22:00","temp":18}]}
         ]'
        ),
        (3, 'Away',
         '[
           {"days":[1,2,3,4,5,6,7],"slots":[{"time":"00:00","temp":"antifreeze"}]}
         ]'
        ),
        (4, 'Off',
         '[
           {"days":[1,2,3,4,5,6,7],"slots":[{"time":"00:00","temp":"off"}]}
         ]'
        );
    PERFORM setval('temperature_programs_id_seq', 2);


    -- Rooms
    INSERT INTO rooms (id, name, temp_program_id, is_heating, offset_value, current_temp)
    VALUES
        (1, 'Living',   1, false,  0.00, 21.50),
        (2, 'Bedroom', 2, false, -0.50, 19.00);
    PERFORM setval('rooms_id_seq', 2);


    -- Light zones
    INSERT INTO light_zones (id, room_id, name, is_on) 
    VALUES
        (1, 1, 'Main lights', false),
        (2, 2, 'Night lights', false);
    PERFORM setval('light_zones_id_seq', 4);


    -- House settings
    INSERT INTO home_settings (id, hysteresis, antifreeze_temp, sampling_period, boiler_state)
    VALUES (1, 0.50, 7.00, 60, false);


    -- Access events
    INSERT INTO access_events (user_id, direction, occurred_at)
    VALUES
        (1, 'in',  CURRENT_TIMESTAMP - INTERVAL '2 hours'),
        (2, 'in',  CURRENT_TIMESTAMP - INTERVAL '5 hours'),
        (2, 'out', CURRENT_TIMESTAMP - INTERVAL '3 hours');

    RAISE NOTICE 'Seed BlueLock successfully applied.';
  ELSE
    RAISE NOTICE 'Database already has data - skipping seed.';
  END IF;
END $$;

-- ============================================================
-- CREDENTIALS
-- ============================================================
--
--  Admin account, home
--    Phone    : 1234567890
--    Password : password
--
--  User account
--    Phone    : 1234567891
--    Password : password
--
--  Suspended user account
--    Phone    : 1234567892
--    Password : password
--
--  Rooms         : Living (id=1), Bedroom (id=2)
--  Light zone    : 2 light zones, one for each room
--  Temp programs : Day (id=1, target 22°C), Night (id=2, target 18°C)
--  Home settings : histeresis=0.5°C, antifreeze=7.0°C, sampling_period=60sec, boiler=off
-- ============================================================
