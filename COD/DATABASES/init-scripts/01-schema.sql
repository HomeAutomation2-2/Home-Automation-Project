CREATE TABLE IF NOT EXISTS users (
    id            SERIAL       PRIMARY KEY,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    cnp           VARCHAR(13)  UNIQUE NOT NULL,
    phone         VARCHAR(20)  UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_admin      BOOLEAN      NOT NULL DEFAULT false,
    is_suspended  BOOLEAN      NOT NULL DEFAULT false,
    is_home       BOOLEAN      NOT NULL DEFAULT false,
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

CREATE TABLE IF NOT EXISTS temperature_programs (
    id          SERIAL       PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    schedule    JSONB        NOT NULL
);

CREATE TABLE IF NOT EXISTS rooms (
    id              SERIAL       PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    temp_program_id INT          REFERENCES temperature_programs(id) ON DELETE SET NULL,
    is_heating      BOOLEAN      DEFAULT false,
    offset_value    DECIMAL(4,2) DEFAULT 0.0,
    current_temp    DECIMAL(4,2) DEFAULT 0.0
);

CREATE TABLE IF NOT EXISTS light_zones (
    id              SERIAL       PRIMARY KEY,
    room_id         INT          REFERENCES rooms(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    is_on           BOOLEAN      DEFAULT false,
    last_changed_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS temperature_readings (
    id         SERIAL       PRIMARY KEY,
    loop_id    INT          REFERENCES rooms(id) ON DELETE CASCADE,
    value      DECIMAL(4,2) NOT NULL,
    occured_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS access_events (
    id          SERIAL      PRIMARY KEY,
    user_id     INT         REFERENCES users(id) ON DELETE SET NULL,
    direction   VARCHAR(10) NOT NULL CHECK (direction IN ('in', 'out')),
    occurred_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS light_events (
    id          SERIAL    PRIMARY KEY,
    zone_id     INT       REFERENCES light_zones(id) ON DELETE SET NULL,
    user_id     INT       REFERENCES users(id) ON DELETE SET NULL,
    new_state   BOOLEAN   NOT NULL,
    occurred_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS boiler_events (
    id          SERIAL    PRIMARY KEY,
    new_state   BOOLEAN   NOT NULL,
    occurred_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS home_settings (
    id              SERIAL       PRIMARY KEY,
    hysteresis      DECIMAL(4,2) NOT NULL,
    antifreeze_temp DECIMAL(4,2) NOT NULL
);
