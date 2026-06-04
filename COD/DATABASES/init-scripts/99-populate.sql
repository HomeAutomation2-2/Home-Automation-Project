-- ============================================================
-- BlueLock — Date de test (seed)
-- Anexa X — Fișier 2/2
-- Versiune: 1.0 | Data: 04.06.2026
-- ============================================================
-- Acest script inserează datele de test doar dacă tabela users
-- este goală, evitând duplicate la reporniri accidentale.
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users LIMIT 1) THEN

    -- Parole în format bcrypt (bcrypt cost 10):
    --   admin123   → $2b$10$mFhDHMBNaodUlBKJ74z8/.yBrMNPFb0IB0Kl.9JDtSMQmWUBQCnGq
    --   user123    → $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p9Unlmgav1Efyzp/OE0bNu
    --   newuser123 → $2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG9LWtSy6nB3xHR8qK
    --
    -- Coduri Bluetooth în format bcrypt:
    --   BT_ADMIN_001 → $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC94JehKhZEnkb9Qn8De
    --   BT_USER_001  → $2b$10$Y3BmhOu7mFpf5FMUXtfLuO.RfXeQkEv7NkzMcJb0LPhJUHsm3m3Xm

    -- Utilizatori
    -- id=1: administrator
    -- id=2: utilizator obișnuit (folosit în testele de rol)
    -- id=3: utilizator pentru testul de creare/suspendare/ștergere (vezi 4.1.7)
    INSERT INTO users
        (id, first_name, last_name, cnp, phone, password_hash, is_admin, is_suspended, is_home, bt_code_hash, bt_code_epoch)
    VALUES
        (1, 'John', 'Doe', '1234567890123', '1234567890', '$2b$10$mfdO0ISDDb8ekf0i2JuAQOwZhQlxMUU80JS5cQzCCfd8XcL44iodi', true,  false, true,  NULL, NULL),
        (2, 'Jane', 'Doe', '1234567890124', '1234567891', '$2b$10$mfdO0ISDDb8ekf0i2JuAQOwZhQlxMUU80JS5cQzCCfd8XcL44iodi', false, false, false, NULL, NULL),
        (3, 'Dani', 'Tes', '1234567890125', '1234567892', '$2b$10$mfdO0ISDDb8ekf0i2JuAQOwZhQlxMUU80JS5cQzCCfd8XcL44iodi', false, true, false, NULL, NULL);

    PERFORM setval('users_id_seq', 3);

    -- Programe de temperatură
    INSERT INTO temperature_programs (id, name, schedule)
    VALUES
        (1, 'Zi',
         '[
           {"days":[1,2,3,4,5],"slots":[{"time":"07:00","temp":22},{"time":"22:00","temp":"antifreeze"}]},
           {"days":[6,7],      "slots":[{"time":"08:00","temp":22},{"time":"23:00","temp":"antifreeze"}]}
         ]'
        ),
        (2, 'Noapte',
         '[
           {"days":[1,2,3,4,5,6,7],"slots":[{"time":"00:00","temp":18},{"time":"08:00","temp":"off"},{"time":"22:00","temp":18}]}
         ]'
        );

    PERFORM setval('temperature_programs_id_seq', 2);

    -- Camere
    INSERT INTO rooms (id, name, temp_program_id, is_heating, offset_value, current_temp)
    VALUES
        (1, 'Living',   1, false,  0.00, 21.50),
        (2, 'Dormitor', 2, false, -0.50, 19.00);

    PERFORM setval('rooms_id_seq', 2);

    -- Zone de iluminat
    INSERT INTO light_zones (id, room_id, name, is_on)
    VALUES
        (1, 1, 'Lumina principală living',   false),
        (2, 1, 'Lumina ambientală living',   false),
        (3, 2, 'Lumina principală dormitor', false),
        (4, 2, 'Lumina ambientală dormitor', false);

    PERFORM setval('light_zones_id_seq', 4);

    -- Setări globale
    INSERT INTO home_settings (id, hysteresis, antifreeze_temp)
    VALUES (1, 0.50, 7.00);

    -- Evenimente de acces istorice (pentru testele de prezență 4.1.6 / 4.2.6)
    INSERT INTO access_events (user_id, direction, occurred_at)
    VALUES
        (1, 'in',  CURRENT_TIMESTAMP - INTERVAL '2 hours'),
        (2, 'in',  CURRENT_TIMESTAMP - INTERVAL '5 hours'),
        (2, 'out', CURRENT_TIMESTAMP - INTERVAL '3 hours');

    RAISE NOTICE 'Seed BlueLock aplicat cu succes.';
  ELSE
    RAISE NOTICE 'Baza de date conține deja date — seed omis.';
  END IF;
END $$;

-- ============================================================
-- CREDENȚIALE REZUMAT (pentru utilizare în cadrul testelor)
-- ============================================================
--
--  Cont administrator
--    Telefon : 1234567890
--    Parolă  : password
--
--  Cont utilizator obișnuit
--    Telefon : 1234567891
--    Parolă  : password
--
--  Cont pentru test creare/suspendare/ștergere (4.1.7)
--    Telefon : 1234567892
--    Parolă  : password
--
--  Camere    : Living (id=1), Dormitor (id=2)
--  Zone      : 4 zone de iluminat (id=1..4)
--  Programe  : Zi (id=1, target 22°C), Noapte (id=2, target 18°C)
--  Setări    : histerezis=0.5°C, antifreeze=7.0°C
-- ============================================================