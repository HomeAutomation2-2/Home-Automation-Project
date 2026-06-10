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
    is_child      BOOLEAN      NOT NULL DEFAULT false,
    allow_return_after_midnight BOOLEAN NOT NULL DEFAULT false,
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
    id                  SERIAL       PRIMARY KEY,
    hysteresis          DECIMAL(4,2) NOT NULL,
    antifreeze_temp     DECIMAL(4,2) NOT NULL,
    sampling_period     INT          NOT NULL,
    boiler_state        BOOLEAN      NOT NULL,
    fire_alert_celsius  DECIMAL(4,2) NOT NULL DEFAULT 45.00
);

CREATE TABLE IF NOT EXISTS notifications (
    id              SERIAL       PRIMARY KEY,
    type            VARCHAR(50)  NOT NULL,
    severity        VARCHAR(20)  NOT NULL DEFAULT 'warning',
    title           VARCHAR(200) NOT NULL,
    message         TEXT         NOT NULL,
    related_user_id INT          REFERENCES users(id) ON DELETE SET NULL,
    related_room_id INT          REFERENCES rooms(id) ON DELETE SET NULL,
    is_read         BOOLEAN      NOT NULL DEFAULT false,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS devices (
    id         SERIAL       PRIMARY KEY,
    ip         VARCHAR(45)  NOT NULL,
    last_seen  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);
