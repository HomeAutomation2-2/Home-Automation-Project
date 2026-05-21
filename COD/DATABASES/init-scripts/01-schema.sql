CREATE TABLE IF NOT EXISTS users (
    id            SERIAL       PRIMARY KEY,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    cnp           VARCHAR(13)  UNIQUE NOT NULL,
    phone         VARCHAR(20)  UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_admin      BOOLEAN      DEFAULT false,
    is_suspended  BOOLEAN      DEFAULT false,
    is_home       BOOLEAN      DEFAULT false,
    bt_code_hash  VARCHAR(255),
    bt_code_epoch INT,
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auth_sessions (
    id         SERIAL       PRIMARY KEY,
    user_id    INT          REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    is_active  BOOLEAN      DEFAULT true,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP    NOT NULL
);

CREATE TABLE IF NOT EXISTS rooms (
    id   SERIAL       PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS temperature_programs (
    id          SERIAL       PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    target_temp DECIMAL(4,2) NOT NULL,
    hysteresis  DECIMAL(3,2) NOT NULL,
    schedule    JSONB        NOT NULL
);

CREATE TABLE IF NOT EXISTS light_zones (
    id              SERIAL       PRIMARY KEY,
    room_id         INT          REFERENCES rooms(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    is_on           BOOLEAN      DEFAULT false,
    last_changed_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS heating_loops (
    id         SERIAL       PRIMARY KEY,
    room_id    INT          REFERENCES rooms(id) ON DELETE CASCADE,
    name       VARCHAR(100) NOT NULL,
    program_id INT          REFERENCES temperature_programs(id) ON DELETE SET NULL,
    is_heating BOOLEAN      DEFAULT false,
    offset_val DECIMAL(3,2) DEFAULT 0.0
);

CREATE TABLE IF NOT EXISTS temperature_readings (
    id         SERIAL       PRIMARY KEY,
    loop_id    INT          REFERENCES heating_loops(id) ON DELETE CASCADE,
    value      DECIMAL(4,2) NOT NULL,
    occured_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id         SERIAL      PRIMARY KEY,
    user_id    INT         REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL, -- 'access', 'light', 'program', 'boiler'
    payload    JSONB       NOT NULL,
    occured_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);