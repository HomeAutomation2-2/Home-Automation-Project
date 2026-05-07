/* =========================================================
   HOME AUTOMATION SYSTEM
   Database Schema — PostgreSQL
   Login identifier: users.phone_number
   ========================================================= */

/* =========================================================
   1. ROLES
   ========================================================= */
CREATE TABLE roles (
    role_id     BIGSERIAL       NOT NULL,
    role_code   VARCHAR(30)     NOT NULL,
    role_name   VARCHAR(100)    NOT NULL,
    description TEXT            NULL,

    CONSTRAINT PK_roles PRIMARY KEY (role_id),
    CONSTRAINT UQ_roles_role_code UNIQUE (role_code)
);

/* =========================================================
   2. HOMES
   ========================================================= */
CREATE TABLE homes (
    home_id      BIGSERIAL                NOT NULL,
    home_name    VARCHAR(150)             NOT NULL,
    address_line VARCHAR(255)             NULL,
    is_active    BOOLEAN                  NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT PK_homes PRIMARY KEY (home_id)
);

/* =========================================================
   3. USERS
   phone_number = unique login identifier
   ========================================================= */
CREATE TABLE users (
    user_id           BIGSERIAL                NOT NULL,
    role_id           BIGINT                   NOT NULL,
    home_id           BIGINT                   NOT NULL,
    first_name        VARCHAR(100)             NOT NULL,
    last_name         VARCHAR(100)             NOT NULL,
    phone_number      VARCHAR(20)              NOT NULL,
    phone_verified_at TIMESTAMP WITH TIME ZONE NULL,
    cnp               VARCHAR(13)              NOT NULL,
    password_hash     VARCHAR(255)             NOT NULL,
    is_active         BOOLEAN                  NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT PK_users PRIMARY KEY (user_id),
    CONSTRAINT FK_users_roles FOREIGN KEY (role_id) REFERENCES roles(role_id),
    CONSTRAINT FK_users_homes FOREIGN KEY (home_id) REFERENCES homes(home_id),
    CONSTRAINT UQ_users_phone_number UNIQUE (phone_number),
    CONSTRAINT UQ_users_cnp UNIQUE (cnp),
    CONSTRAINT CK_users_cnp_length    CHECK (LENGTH(cnp) = 13),
    CONSTRAINT CK_users_phone_length  CHECK (LENGTH(phone_number) BETWEEN 10 AND 20)
);

CREATE INDEX IX_users_home_id ON users(home_id);

/* =========================================================
   4. AUTH SESSIONS
   ========================================================= */
CREATE TABLE auth_sessions (
    session_id         BIGSERIAL                NOT NULL,
    user_id            BIGINT                   NOT NULL,
    access_token_hash  VARCHAR(255)             NOT NULL,
    refresh_token_hash VARCHAR(255)             NULL,
    client_type        VARCHAR(20)              NOT NULL,
    ip_address         VARCHAR(64)              NULL,
    user_agent         VARCHAR(500)             NULL,
    issued_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at         TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at         TIMESTAMP WITH TIME ZONE NULL,

    CONSTRAINT PK_auth_sessions PRIMARY KEY (session_id),
    CONSTRAINT FK_auth_sessions_users FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT CK_auth_sessions_client_type CHECK (client_type IN ('WEB', 'MOBILE_APP', 'ACCESS_APP'))
);

CREATE INDEX IX_auth_sessions_user_id ON auth_sessions(user_id);

/* =========================================================
   5. DEVICES
   ========================================================= */
CREATE TABLE devices (
    device_id        BIGSERIAL                NOT NULL,
    home_id          BIGINT                   NOT NULL,
    device_type      VARCHAR(30)              NOT NULL,
    serial_no        VARCHAR(100)             NULL,
    mac_address      VARCHAR(50)              NULL,
    firmware_version VARCHAR(50)              NULL,
    device_name      VARCHAR(150)             NULL,
    last_seen_at     TIMESTAMP WITH TIME ZONE NULL,
    is_active        BOOLEAN                  NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT PK_devices PRIMARY KEY (device_id),
    CONSTRAINT FK_devices_homes FOREIGN KEY (home_id) REFERENCES homes(home_id),
    CONSTRAINT UQ_devices_serial_no   UNIQUE (serial_no),
    CONSTRAINT UQ_devices_mac_address UNIQUE (mac_address),
    CONSTRAINT CK_devices_type CHECK (
        device_type IN (
            'SMARTPHONE',
            'ESP32',
            'TEMP_MODULE',
            'RELAY_MODULE',
            'BUTTON_MODULE',
            'LOCK_ACTUATOR',
            'BOILER_RELAY',
            'VALVE_ACTUATOR',
            'LIGHT_RELAY'
        )
    )
);

CREATE INDEX IX_devices_home_id ON devices(home_id);

/* =========================================================
   6. USER DEVICES
   Unique binding user <-> smartphone
   ========================================================= */
CREATE TABLE user_devices (
    user_device_id              BIGSERIAL                NOT NULL,
    user_id                     BIGINT                   NOT NULL,
    device_id                   BIGINT                   NOT NULL,
    bluetooth_security_code_hash VARCHAR(255)            NOT NULL,
    puk_code_hash               VARCHAR(255)             NOT NULL,
    is_primary                  BOOLEAN                  NOT NULL DEFAULT TRUE,
    is_active                   BOOLEAN                  NOT NULL DEFAULT TRUE,
    bound_at                    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    unbound_at                  TIMESTAMP WITH TIME ZONE NULL,

    CONSTRAINT PK_user_devices PRIMARY KEY (user_device_id),
    CONSTRAINT FK_user_devices_users   FOREIGN KEY (user_id)   REFERENCES users(user_id),
    CONSTRAINT FK_user_devices_devices FOREIGN KEY (device_id) REFERENCES devices(device_id),
    CONSTRAINT UQ_user_devices_user_device UNIQUE (user_id, device_id)
);

/* One active primary smartphone per user */
CREATE UNIQUE INDEX UX_user_devices_active_primary_user
    ON user_devices(user_id)
    WHERE is_active = TRUE AND is_primary = TRUE;

/* One active user per device */
CREATE UNIQUE INDEX UX_user_devices_active_device
    ON user_devices(device_id)
    WHERE is_active = TRUE;

/* =========================================================
   7. ROOMS
   ========================================================= */
CREATE TABLE rooms (
    room_id    BIGSERIAL                NOT NULL,
    home_id    BIGINT                   NOT NULL,
    room_name  VARCHAR(100)             NOT NULL,
    room_type  VARCHAR(50)              NULL,
    floor_no   INT                      NULL,
    is_active  BOOLEAN                  NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT PK_rooms PRIMARY KEY (room_id),
    CONSTRAINT FK_rooms_homes FOREIGN KEY (home_id) REFERENCES homes(home_id),
    CONSTRAINT UQ_rooms_home_room_name UNIQUE (home_id, room_name)
);

/* =========================================================
   8. ROOM DEVICES
   ========================================================= */
CREATE TABLE room_devices (
    room_device_id BIGSERIAL                NOT NULL,
    room_id        BIGINT                   NOT NULL,
    device_id      BIGINT                   NOT NULL,
    device_role    VARCHAR(30)              NOT NULL,
    installed_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_active      BOOLEAN                  NOT NULL DEFAULT TRUE,

    CONSTRAINT PK_room_devices PRIMARY KEY (room_device_id),
    CONSTRAINT FK_room_devices_rooms   FOREIGN KEY (room_id)   REFERENCES rooms(room_id),
    CONSTRAINT FK_room_devices_devices FOREIGN KEY (device_id) REFERENCES devices(device_id),
    CONSTRAINT UQ_room_devices_room_device UNIQUE (room_id, device_id),
    CONSTRAINT CK_room_devices_role CHECK (
        device_role IN (
            'TEMP_SENSOR',
            'LIGHT_RELAY',
            'BUTTON_READER',
            'VALVE_ACTUATOR',
            'LOCK_ACTUATOR',
            'BOILER_RELAY'
        )
    )
);

CREATE INDEX IX_room_devices_room_id   ON room_devices(room_id);
CREATE INDEX IX_room_devices_device_id ON room_devices(device_id);

/* =========================================================
   9. ACCESS POINTS
   ========================================================= */
CREATE TABLE access_points (
    access_point_id      BIGSERIAL                NOT NULL,
    home_id              BIGINT                   NOT NULL,
    esp32_device_id      BIGINT                   NOT NULL,
    lock_device_id       BIGINT                   NULL,
    access_point_name    VARCHAR(100)             NOT NULL,
    location_description VARCHAR(255)             NULL,
    is_active            BOOLEAN                  NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT PK_access_points PRIMARY KEY (access_point_id),
    CONSTRAINT FK_access_points_homes FOREIGN KEY (home_id)         REFERENCES homes(home_id),
    CONSTRAINT FK_access_points_esp32 FOREIGN KEY (esp32_device_id) REFERENCES devices(device_id),
    CONSTRAINT FK_access_points_lock  FOREIGN KEY (lock_device_id)  REFERENCES devices(device_id),
    CONSTRAINT UQ_access_points_home_name UNIQUE (home_id, access_point_name)
);

/* =========================================================
   10. ACCESS EVENTS
   ========================================================= */
CREATE TABLE access_events (
    access_event_id  BIGSERIAL                NOT NULL,
    access_point_id  BIGINT                   NOT NULL,
    user_id          BIGINT                   NULL,
    device_id        BIGINT                   NULL,
    direction        VARCHAR(10)              NOT NULL,
    result           VARCHAR(15)              NOT NULL,
    event_time       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    source           VARCHAR(20)              NOT NULL DEFAULT 'BLUETOOTH',
    local_event_id   VARCHAR(100)             NULL,
    synced_at        TIMESTAMP WITH TIME ZONE NULL,
    failure_reason   VARCHAR(255)             NULL,
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT PK_access_events PRIMARY KEY (access_event_id),
    CONSTRAINT FK_access_events_access_points FOREIGN KEY (access_point_id) REFERENCES access_points(access_point_id),
    CONSTRAINT FK_access_events_users         FOREIGN KEY (user_id)         REFERENCES users(user_id),
    CONSTRAINT FK_access_events_devices       FOREIGN KEY (device_id)       REFERENCES devices(device_id),
    CONSTRAINT CK_access_events_direction CHECK (direction IN ('ENTRY', 'EXIT')),
    CONSTRAINT CK_access_events_result    CHECK (result    IN ('AUTHORIZED', 'DENIED')),
    CONSTRAINT CK_access_events_source    CHECK (source    IN ('BLUETOOTH', 'WEB', 'APP', 'LOCAL'))
);

CREATE INDEX IX_access_events_event_time      ON access_events(event_time DESC);
CREATE INDEX IX_access_events_user_event_time ON access_events(user_id, event_time DESC);

/* =========================================================
   11. PRESENCE STATUS
   ========================================================= */
CREATE TABLE presence_status (
    user_id             BIGINT                   NOT NULL,
    is_home             BOOLEAN                  NOT NULL DEFAULT FALSE,
    last_entry_at       TIMESTAMP WITH TIME ZONE NULL,
    last_exit_at        TIMESTAMP WITH TIME ZONE NULL,
    last_access_event_id BIGINT                  NULL,
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT PK_presence_status PRIMARY KEY (user_id),
    CONSTRAINT FK_presence_status_users         FOREIGN KEY (user_id)              REFERENCES users(user_id),
    CONSTRAINT FK_presence_status_access_events FOREIGN KEY (last_access_event_id) REFERENCES access_events(access_event_id)
);

/* =========================================================
   12. LIGHT ZONES
   ========================================================= */
CREATE TABLE light_zones (
    light_zone_id    BIGSERIAL                NOT NULL,
    room_id          BIGINT                   NOT NULL,
    relay_device_id  BIGINT                   NOT NULL,
    zone_name        VARCHAR(100)             NOT NULL,
    relay_channel_no INT                      NOT NULL,
    is_active        BOOLEAN                  NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT PK_light_zones PRIMARY KEY (light_zone_id),
    CONSTRAINT FK_light_zones_rooms   FOREIGN KEY (room_id)         REFERENCES rooms(room_id),
    CONSTRAINT FK_light_zones_devices FOREIGN KEY (relay_device_id) REFERENCES devices(device_id),
    CONSTRAINT UQ_light_zones_room_name      UNIQUE (room_id, zone_name),
    CONSTRAINT UQ_light_zones_device_channel UNIQUE (relay_device_id, relay_channel_no),
    CONSTRAINT CK_light_zones_channel CHECK (relay_channel_no > 0)
);

/* =========================================================
   13. LIGHT COMMANDS
   ========================================================= */
CREATE TABLE light_commands (
    light_command_id    BIGSERIAL                NOT NULL,
    light_zone_id       BIGINT                   NOT NULL,
    requested_by_user_id BIGINT                  NOT NULL,
    command_type        VARCHAR(10)              NOT NULL,
    request_channel     VARCHAR(20)              NOT NULL,
    requested_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    status              VARCHAR(15)              NOT NULL DEFAULT 'PENDING',
    executed_at         TIMESTAMP WITH TIME ZONE NULL,
    failure_reason      VARCHAR(255)             NULL,

    CONSTRAINT PK_light_commands PRIMARY KEY (light_command_id),
    CONSTRAINT FK_light_commands_light_zones FOREIGN KEY (light_zone_id)        REFERENCES light_zones(light_zone_id),
    CONSTRAINT FK_light_commands_users       FOREIGN KEY (requested_by_user_id) REFERENCES users(user_id),
    CONSTRAINT CK_light_commands_type    CHECK (command_type    IN ('ON', 'OFF')),
    CONSTRAINT CK_light_commands_channel CHECK (request_channel IN ('WEB', 'APP', 'LOCAL')),
    CONSTRAINT CK_light_commands_status  CHECK (status          IN ('PENDING', 'EXECUTED', 'FAILED'))
);

CREATE INDEX IX_light_commands_zone_requested_at ON light_commands(light_zone_id, requested_at DESC);

/* =========================================================
   14. LIGHT EVENTS
   ========================================================= */
CREATE TABLE light_events (
    light_event_id      BIGSERIAL                NOT NULL,
    light_zone_id       BIGINT                   NOT NULL,
    command_id          BIGINT                   NULL,
    event_type          VARCHAR(15)              NOT NULL,
    event_time          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    source_device_id    BIGINT                   NULL,
    triggered_by_user_id BIGINT                  NULL,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT PK_light_events PRIMARY KEY (light_event_id),
    CONSTRAINT FK_light_events_light_zones    FOREIGN KEY (light_zone_id)        REFERENCES light_zones(light_zone_id),
    CONSTRAINT FK_light_events_light_commands FOREIGN KEY (command_id)           REFERENCES light_commands(light_command_id),
    CONSTRAINT FK_light_events_devices        FOREIGN KEY (source_device_id)     REFERENCES devices(device_id),
    CONSTRAINT FK_light_events_users          FOREIGN KEY (triggered_by_user_id) REFERENCES users(user_id),
    CONSTRAINT CK_light_events_type CHECK (event_type IN ('LIGHT_ON', 'LIGHT_OFF'))
);

CREATE INDEX IX_light_events_zone_event_time ON light_events(light_zone_id, event_time DESC);

/* =========================================================
   15. HEATING LOOPS
   ========================================================= */
CREATE TABLE heating_loops (
    heating_loop_id         BIGSERIAL                NOT NULL,
    room_id                 BIGINT                   NOT NULL,
    temp_sensor_device_id   BIGINT                   NOT NULL,
    valve_device_id         BIGINT                   NOT NULL,
    loop_name               VARCHAR(100)             NOT NULL,
    default_sampling_minutes INT                     NOT NULL DEFAULT 5,
    is_active               BOOLEAN                  NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT PK_heating_loops PRIMARY KEY (heating_loop_id),
    CONSTRAINT FK_heating_loops_rooms             FOREIGN KEY (room_id)               REFERENCES rooms(room_id),
    CONSTRAINT FK_heating_loops_temp_sensor_device FOREIGN KEY (temp_sensor_device_id) REFERENCES devices(device_id),
    CONSTRAINT FK_heating_loops_valve_device       FOREIGN KEY (valve_device_id)       REFERENCES devices(device_id),
    CONSTRAINT UQ_heating_loops_room_name   UNIQUE (room_id, loop_name),
    CONSTRAINT UQ_heating_loops_temp_sensor UNIQUE (temp_sensor_device_id),
    CONSTRAINT UQ_heating_loops_valve_device UNIQUE (valve_device_id),
    CONSTRAINT CK_heating_loops_sampling CHECK (default_sampling_minutes IN (1, 5, 10, 30))
);

/* =========================================================
   16. HEATING PROFILES
   ========================================================= */
CREATE TABLE heating_profiles (
    heating_profile_id BIGSERIAL                NOT NULL,
    heating_loop_id    BIGINT                   NOT NULL,
    profile_name       VARCHAR(100)             NOT NULL,
    profile_type       VARCHAR(20)              NOT NULL,
    is_default         BOOLEAN                  NOT NULL DEFAULT FALSE,
    is_active          BOOLEAN                  NOT NULL DEFAULT TRUE,
    created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT PK_heating_profiles PRIMARY KEY (heating_profile_id),
    CONSTRAINT FK_heating_profiles_heating_loops FOREIGN KEY (heating_loop_id) REFERENCES heating_loops(heating_loop_id),
    CONSTRAINT UQ_heating_profiles_loop_name UNIQUE (heating_loop_id, profile_name),
    CONSTRAINT CK_heating_profiles_type CHECK (profile_type IN ('WEEKDAY', 'WEEKEND', 'VACATION', 'DAILY', 'CUSTOM'))
);

/* =========================================================
   17. HEATING SCHEDULE ENTRIES
   ========================================================= */
CREATE TABLE heating_schedule_entries (
    schedule_entry_id  BIGSERIAL                NOT NULL,
    heating_profile_id BIGINT                   NOT NULL,
    day_type           VARCHAR(20)              NOT NULL,
    sequence_no        INT                      NOT NULL,
    start_time         TIME                     NOT NULL,
    end_time           TIME                     NOT NULL,
    target_temperature DECIMAL(5,2)             NOT NULL,
    hysteresis         DECIMAL(5,2)             NOT NULL,
    temp_offset        DECIMAL(5,2)             NOT NULL DEFAULT 0.00,
    created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT PK_heating_schedule_entries PRIMARY KEY (schedule_entry_id),
    CONSTRAINT FK_heating_schedule_entries_profiles FOREIGN KEY (heating_profile_id) REFERENCES heating_profiles(heating_profile_id),
    CONSTRAINT UQ_heating_schedule_entries_profile_day_seq UNIQUE (heating_profile_id, day_type, sequence_no),
    CONSTRAINT CK_heating_schedule_entries_day_type CHECK (
        day_type IN (
            'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY',
            'SATURDAY', 'SUNDAY',
            'WEEKDAY', 'WEEKEND', 'VACATION'
        )
    ),
    CONSTRAINT CK_heating_schedule_entries_time_range  CHECK (start_time < end_time),
    CONSTRAINT CK_heating_schedule_entries_target_temp CHECK (target_temperature BETWEEN 5.00 AND 35.00),
    CONSTRAINT CK_heating_schedule_entries_hysteresis  CHECK (hysteresis > 0.00 AND hysteresis <= 10.00),
    CONSTRAINT CK_heating_schedule_entries_offset      CHECK (temp_offset BETWEEN -10.00 AND 10.00)
);

/* =========================================================
   18. HEATING OVERRIDES
   ========================================================= */
CREATE TABLE heating_overrides (
    heating_override_id  BIGSERIAL                NOT NULL,
    heating_loop_id      BIGINT                   NOT NULL,
    requested_by_user_id BIGINT                   NOT NULL,
    override_type        VARCHAR(20)              NOT NULL,
    target_profile_id    BIGINT                   NULL,
    target_temperature   DECIMAL(5,2)             NULL,
    start_at             TIMESTAMP WITH TIME ZONE NOT NULL,
    end_at               TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active            BOOLEAN                  NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT PK_heating_overrides PRIMARY KEY (heating_override_id),
    CONSTRAINT FK_heating_overrides_heating_loops FOREIGN KEY (heating_loop_id)      REFERENCES heating_loops(heating_loop_id),
    CONSTRAINT FK_heating_overrides_users         FOREIGN KEY (requested_by_user_id) REFERENCES users(user_id),
    CONSTRAINT FK_heating_overrides_profiles      FOREIGN KEY (target_profile_id)    REFERENCES heating_profiles(heating_profile_id),
    CONSTRAINT CK_heating_overrides_type   CHECK (override_type IN ('PROFILE_SWITCH', 'TEMP_SETPOINT')),
    CONSTRAINT CK_heating_overrides_time   CHECK (start_at < end_at),
    CONSTRAINT CK_heating_overrides_temp   CHECK (target_temperature IS NULL OR target_temperature BETWEEN 5.00 AND 35.00),
    CONSTRAINT CK_heating_overrides_logic  CHECK (
        (override_type = 'PROFILE_SWITCH' AND target_profile_id    IS NOT NULL)
        OR
        (override_type = 'TEMP_SETPOINT'  AND target_temperature   IS NOT NULL)
    )
);

/* =========================================================
   19. TEMPERATURE READINGS
   ========================================================= */
CREATE TABLE temperature_readings (
    temperature_reading_id BIGSERIAL                NOT NULL,
    heating_loop_id        BIGINT                   NOT NULL,
    device_id              BIGINT                   NOT NULL,
    temperature_c          DECIMAL(5,2)             NOT NULL,
    sampled_at             TIMESTAMP WITH TIME ZONE NOT NULL,
    sampling_minutes       INT                      NOT NULL,
    received_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    quality_flag           VARCHAR(20)              NOT NULL DEFAULT 'OK',

    CONSTRAINT PK_temperature_readings PRIMARY KEY (temperature_reading_id),
    CONSTRAINT FK_temperature_readings_heating_loops FOREIGN KEY (heating_loop_id) REFERENCES heating_loops(heating_loop_id),
    CONSTRAINT FK_temperature_readings_devices       FOREIGN KEY (device_id)       REFERENCES devices(device_id),
    CONSTRAINT CK_temperature_readings_sampling     CHECK (sampling_minutes IN (1, 5, 10, 30)),
    CONSTRAINT CK_temperature_readings_quality_flag CHECK (quality_flag IN ('OK', 'MISSING', 'OUTLIER')),
    CONSTRAINT CK_temperature_readings_temp         CHECK (temperature_c BETWEEN -40.00 AND 100.00)
);

CREATE INDEX IX_temperature_readings_loop_sampled_at ON temperature_readings(heating_loop_id, sampled_at DESC);

/* =========================================================
   20. HEATING DEMANDS
   ========================================================= */
CREATE TABLE heating_demands (
    heating_demand_id      BIGSERIAL                NOT NULL,
    heating_loop_id        BIGINT                   NOT NULL,
    temperature_reading_id BIGINT                   NOT NULL,
    target_temperature     DECIMAL(5,2)             NOT NULL,
    hysteresis             DECIMAL(5,2)             NOT NULL,
    temp_offset            DECIMAL(5,2)             NOT NULL DEFAULT 0.00,
    demand_state           VARCHAR(20)              NOT NULL,
    evaluated_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT PK_heating_demands PRIMARY KEY (heating_demand_id),
    CONSTRAINT FK_heating_demands_heating_loops          FOREIGN KEY (heating_loop_id)        REFERENCES heating_loops(heating_loop_id),
    CONSTRAINT FK_heating_demands_temperature_readings   FOREIGN KEY (temperature_reading_id) REFERENCES temperature_readings(temperature_reading_id),
    CONSTRAINT CK_heating_demands_state       CHECK (demand_state IN ('HEAT_REQUIRED', 'NO_HEAT_REQUIRED')),
    CONSTRAINT CK_heating_demands_target_temp CHECK (target_temperature BETWEEN 5.00 AND 35.00),
    CONSTRAINT CK_heating_demands_hysteresis  CHECK (hysteresis > 0.00 AND hysteresis <= 10.00),
    CONSTRAINT CK_heating_demands_offset      CHECK (temp_offset BETWEEN -10.00 AND 10.00)
);

CREATE INDEX IX_heating_demands_loop_evaluated_at ON heating_demands(heating_loop_id, evaluated_at DESC);

/* =========================================================
   21. VALVE EVENTS
   ========================================================= */
CREATE TABLE valve_events (
    valve_event_id  BIGSERIAL                NOT NULL,
    heating_loop_id BIGINT                   NOT NULL,
    device_id       BIGINT                   NOT NULL,
    valve_state     VARCHAR(10)              NOT NULL,
    reason          VARCHAR(30)              NOT NULL,
    event_time      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT PK_valve_events PRIMARY KEY (valve_event_id),
    CONSTRAINT FK_valve_events_heating_loops FOREIGN KEY (heating_loop_id) REFERENCES heating_loops(heating_loop_id),
    CONSTRAINT FK_valve_events_devices       FOREIGN KEY (device_id)       REFERENCES devices(device_id),
    CONSTRAINT CK_valve_events_state  CHECK (valve_state IN ('OPEN', 'CLOSED')),
    CONSTRAINT CK_valve_events_reason CHECK (reason IN ('CONTROL_LOOP', 'MANUAL_TEST', 'FAILSAFE'))
);

CREATE INDEX IX_valve_events_loop_event_time ON valve_events(heating_loop_id, event_time DESC);

/* =========================================================
   22. BOILER CONTROLLER
   One controller per home
   ========================================================= */
CREATE TABLE boiler_controller (
    boiler_controller_id BIGSERIAL                NOT NULL,
    home_id              BIGINT                   NOT NULL,
    relay_device_id      BIGINT                   NOT NULL,
    controller_name      VARCHAR(100)             NOT NULL,
    is_active            BOOLEAN                  NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT PK_boiler_controller PRIMARY KEY (boiler_controller_id),
    CONSTRAINT FK_boiler_controller_homes   FOREIGN KEY (home_id)         REFERENCES homes(home_id),
    CONSTRAINT FK_boiler_controller_devices FOREIGN KEY (relay_device_id) REFERENCES devices(device_id),
    CONSTRAINT UQ_boiler_controller_home  UNIQUE (home_id),
    CONSTRAINT UQ_boiler_controller_relay UNIQUE (relay_device_id)
);

/* =========================================================
   23. BOILER EVENTS
   ========================================================= */
CREATE TABLE boiler_events (
    boiler_event_id      BIGSERIAL                NOT NULL,
    boiler_controller_id BIGINT                   NOT NULL,
    trigger_loop_id      BIGINT                   NULL,
    event_type           VARCHAR(15)              NOT NULL,
    reason               VARCHAR(40)              NOT NULL,
    event_time           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT PK_boiler_events PRIMARY KEY (boiler_event_id),
    CONSTRAINT FK_boiler_events_boiler_controller FOREIGN KEY (boiler_controller_id) REFERENCES boiler_controller(boiler_controller_id),
    CONSTRAINT FK_boiler_events_heating_loops     FOREIGN KEY (trigger_loop_id)      REFERENCES heating_loops(heating_loop_id),
    CONSTRAINT CK_boiler_events_type   CHECK (event_type IN ('BOILER_ON', 'BOILER_OFF')),
    CONSTRAINT CK_boiler_events_reason CHECK (reason IN ('ANY_LOOP_DEMANDED_HEAT', 'NO_ACTIVE_DEMAND', 'MANUAL_TEST', 'FAILSAFE'))
);

CREATE INDEX IX_boiler_events_event_time ON boiler_events(event_time DESC);

/* =========================================================
   24. DEVICE STATUS LOG
   ========================================================= */
CREATE TABLE device_status_log (
    device_status_log_id BIGSERIAL                NOT NULL,
    device_id            BIGINT                   NOT NULL,
    status_type          VARCHAR(20)              NOT NULL,
    status_time          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    details_json         JSONB                    NULL,
    created_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT PK_device_status_log PRIMARY KEY (device_status_log_id),
    CONSTRAINT FK_device_status_log_devices FOREIGN KEY (device_id) REFERENCES devices(device_id),
    CONSTRAINT CK_device_status_log_type CHECK (
        status_type IN ('ONLINE', 'OFFLINE', 'LOW_SIGNAL', 'ERROR', 'MAINTENANCE')
    )
    /* Note: details_json JSON validity is enforced natively by the JSONB type */
);

CREATE INDEX IX_device_status_log_device_time ON device_status_log(device_id, status_time DESC);
