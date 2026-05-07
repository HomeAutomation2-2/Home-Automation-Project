-- CreateTable
CREATE TABLE "roles" (
    "role_id" BIGSERIAL NOT NULL,
    "role_code" VARCHAR(30) NOT NULL,
    "role_name" VARCHAR(100) NOT NULL,
    "description" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "homes" (
    "home_id" BIGSERIAL NOT NULL,
    "home_name" VARCHAR(150) NOT NULL,
    "address_line" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "homes_pkey" PRIMARY KEY ("home_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" BIGSERIAL NOT NULL,
    "role_id" BIGINT NOT NULL,
    "home_id" BIGINT NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "phone_number" VARCHAR(20) NOT NULL,
    "phone_verified_at" TIMESTAMPTZ,
    "cnp" VARCHAR(13) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "auth_sessions" (
    "session_id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "access_token_hash" VARCHAR(255) NOT NULL,
    "refresh_token_hash" VARCHAR(255),
    "client_type" VARCHAR(20) NOT NULL,
    "ip_address" VARCHAR(64),
    "user_agent" VARCHAR(500),
    "issued_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "revoked_at" TIMESTAMPTZ,

    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "devices" (
    "device_id" BIGSERIAL NOT NULL,
    "home_id" BIGINT NOT NULL,
    "device_type" VARCHAR(30) NOT NULL,
    "serial_no" VARCHAR(100),
    "mac_address" VARCHAR(50),
    "firmware_version" VARCHAR(50),
    "device_name" VARCHAR(150),
    "last_seen_at" TIMESTAMPTZ,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("device_id")
);

-- CreateTable
CREATE TABLE "user_devices" (
    "user_device_id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "device_id" BIGINT NOT NULL,
    "bluetooth_security_code_hash" VARCHAR(255) NOT NULL,
    "puk_code_hash" VARCHAR(255) NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "bound_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unbound_at" TIMESTAMPTZ,

    CONSTRAINT "user_devices_pkey" PRIMARY KEY ("user_device_id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "room_id" BIGSERIAL NOT NULL,
    "home_id" BIGINT NOT NULL,
    "room_name" VARCHAR(100) NOT NULL,
    "room_type" VARCHAR(50),
    "floor_no" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("room_id")
);

-- CreateTable
CREATE TABLE "room_devices" (
    "room_device_id" BIGSERIAL NOT NULL,
    "room_id" BIGINT NOT NULL,
    "device_id" BIGINT NOT NULL,
    "device_role" VARCHAR(30) NOT NULL,
    "installed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "room_devices_pkey" PRIMARY KEY ("room_device_id")
);

-- CreateTable
CREATE TABLE "access_points" (
    "access_point_id" BIGSERIAL NOT NULL,
    "home_id" BIGINT NOT NULL,
    "esp32_device_id" BIGINT NOT NULL,
    "lock_device_id" BIGINT,
    "access_point_name" VARCHAR(100) NOT NULL,
    "location_description" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "access_points_pkey" PRIMARY KEY ("access_point_id")
);

-- CreateTable
CREATE TABLE "access_events" (
    "access_event_id" BIGSERIAL NOT NULL,
    "access_point_id" BIGINT NOT NULL,
    "user_id" BIGINT,
    "device_id" BIGINT,
    "direction" VARCHAR(10) NOT NULL,
    "result" VARCHAR(15) NOT NULL,
    "event_time" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" VARCHAR(20) NOT NULL DEFAULT 'BLUETOOTH',
    "local_event_id" VARCHAR(100),
    "synced_at" TIMESTAMPTZ,
    "failure_reason" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "access_events_pkey" PRIMARY KEY ("access_event_id")
);

-- CreateTable
CREATE TABLE "presence_status" (
    "user_id" BIGINT NOT NULL,
    "is_home" BOOLEAN NOT NULL DEFAULT false,
    "last_entry_at" TIMESTAMPTZ,
    "last_exit_at" TIMESTAMPTZ,
    "last_access_event_id" BIGINT,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "presence_status_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "light_zones" (
    "light_zone_id" BIGSERIAL NOT NULL,
    "room_id" BIGINT NOT NULL,
    "relay_device_id" BIGINT NOT NULL,
    "zone_name" VARCHAR(100) NOT NULL,
    "relay_channel_no" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "light_zones_pkey" PRIMARY KEY ("light_zone_id")
);

-- CreateTable
CREATE TABLE "light_commands" (
    "light_command_id" BIGSERIAL NOT NULL,
    "light_zone_id" BIGINT NOT NULL,
    "requested_by_user_id" BIGINT NOT NULL,
    "command_type" VARCHAR(10) NOT NULL,
    "request_channel" VARCHAR(20) NOT NULL,
    "requested_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(15) NOT NULL DEFAULT 'PENDING',
    "executed_at" TIMESTAMPTZ,
    "failure_reason" VARCHAR(255),

    CONSTRAINT "light_commands_pkey" PRIMARY KEY ("light_command_id")
);

-- CreateTable
CREATE TABLE "light_events" (
    "light_event_id" BIGSERIAL NOT NULL,
    "light_zone_id" BIGINT NOT NULL,
    "command_id" BIGINT,
    "event_type" VARCHAR(15) NOT NULL,
    "event_time" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source_device_id" BIGINT,
    "triggered_by_user_id" BIGINT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "light_events_pkey" PRIMARY KEY ("light_event_id")
);

-- CreateTable
CREATE TABLE "heating_loops" (
    "heating_loop_id" BIGSERIAL NOT NULL,
    "room_id" BIGINT NOT NULL,
    "temp_sensor_device_id" BIGINT NOT NULL,
    "valve_device_id" BIGINT NOT NULL,
    "loop_name" VARCHAR(100) NOT NULL,
    "default_sampling_minutes" INTEGER NOT NULL DEFAULT 5,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "heating_loops_pkey" PRIMARY KEY ("heating_loop_id")
);

-- CreateTable
CREATE TABLE "heating_profiles" (
    "heating_profile_id" BIGSERIAL NOT NULL,
    "heating_loop_id" BIGINT NOT NULL,
    "profile_name" VARCHAR(100) NOT NULL,
    "profile_type" VARCHAR(20) NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "heating_profiles_pkey" PRIMARY KEY ("heating_profile_id")
);

-- CreateTable
CREATE TABLE "heating_schedule_entries" (
    "schedule_entry_id" BIGSERIAL NOT NULL,
    "heating_profile_id" BIGINT NOT NULL,
    "day_type" VARCHAR(20) NOT NULL,
    "sequence_no" INTEGER NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "target_temperature" DECIMAL(5,2) NOT NULL,
    "hysteresis" DECIMAL(5,2) NOT NULL,
    "temp_offset" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "heating_schedule_entries_pkey" PRIMARY KEY ("schedule_entry_id")
);

-- CreateTable
CREATE TABLE "heating_overrides" (
    "heating_override_id" BIGSERIAL NOT NULL,
    "heating_loop_id" BIGINT NOT NULL,
    "requested_by_user_id" BIGINT NOT NULL,
    "override_type" VARCHAR(20) NOT NULL,
    "target_profile_id" BIGINT,
    "target_temperature" DECIMAL(5,2),
    "start_at" TIMESTAMPTZ NOT NULL,
    "end_at" TIMESTAMPTZ NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "heating_overrides_pkey" PRIMARY KEY ("heating_override_id")
);

-- CreateTable
CREATE TABLE "temperature_readings" (
    "temperature_reading_id" BIGSERIAL NOT NULL,
    "heating_loop_id" BIGINT NOT NULL,
    "device_id" BIGINT NOT NULL,
    "temperature_c" DECIMAL(5,2) NOT NULL,
    "sampled_at" TIMESTAMPTZ NOT NULL,
    "sampling_minutes" INTEGER NOT NULL,
    "received_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quality_flag" VARCHAR(20) NOT NULL DEFAULT 'OK',

    CONSTRAINT "temperature_readings_pkey" PRIMARY KEY ("temperature_reading_id")
);

-- CreateTable
CREATE TABLE "heating_demands" (
    "heating_demand_id" BIGSERIAL NOT NULL,
    "heating_loop_id" BIGINT NOT NULL,
    "temperature_reading_id" BIGINT NOT NULL,
    "target_temperature" DECIMAL(5,2) NOT NULL,
    "hysteresis" DECIMAL(5,2) NOT NULL,
    "temp_offset" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "demand_state" VARCHAR(20) NOT NULL,
    "evaluated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "heating_demands_pkey" PRIMARY KEY ("heating_demand_id")
);

-- CreateTable
CREATE TABLE "valve_events" (
    "valve_event_id" BIGSERIAL NOT NULL,
    "heating_loop_id" BIGINT NOT NULL,
    "device_id" BIGINT NOT NULL,
    "valve_state" VARCHAR(10) NOT NULL,
    "reason" VARCHAR(30) NOT NULL,
    "event_time" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "valve_events_pkey" PRIMARY KEY ("valve_event_id")
);

-- CreateTable
CREATE TABLE "boiler_controller" (
    "boiler_controller_id" BIGSERIAL NOT NULL,
    "home_id" BIGINT NOT NULL,
    "relay_device_id" BIGINT NOT NULL,
    "controller_name" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "boiler_controller_pkey" PRIMARY KEY ("boiler_controller_id")
);

-- CreateTable
CREATE TABLE "boiler_events" (
    "boiler_event_id" BIGSERIAL NOT NULL,
    "boiler_controller_id" BIGINT NOT NULL,
    "trigger_loop_id" BIGINT,
    "event_type" VARCHAR(15) NOT NULL,
    "reason" VARCHAR(40) NOT NULL,
    "event_time" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "boiler_events_pkey" PRIMARY KEY ("boiler_event_id")
);

-- CreateTable
CREATE TABLE "device_status_log" (
    "device_status_log_id" BIGSERIAL NOT NULL,
    "device_id" BIGINT NOT NULL,
    "status_type" VARCHAR(20) NOT NULL,
    "status_time" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details_json" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_status_log_pkey" PRIMARY KEY ("device_status_log_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_code_key" ON "roles"("role_code");

-- CreateIndex
CREATE INDEX "IX_users_home_id" ON "users"("home_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_key" ON "users"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "users_cnp_key" ON "users"("cnp");

-- CreateIndex
CREATE INDEX "IX_auth_sessions_user_id" ON "auth_sessions"("user_id");

-- CreateIndex
CREATE INDEX "IX_devices_home_id" ON "devices"("home_id");

-- CreateIndex
CREATE UNIQUE INDEX "devices_serial_no_key" ON "devices"("serial_no");

-- CreateIndex
CREATE UNIQUE INDEX "devices_mac_address_key" ON "devices"("mac_address");

-- CreateIndex
CREATE UNIQUE INDEX "user_devices_user_id_device_id_key" ON "user_devices"("user_id", "device_id");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_home_id_room_name_key" ON "rooms"("home_id", "room_name");

-- CreateIndex
CREATE INDEX "IX_room_devices_room_id" ON "room_devices"("room_id");

-- CreateIndex
CREATE INDEX "IX_room_devices_device_id" ON "room_devices"("device_id");

-- CreateIndex
CREATE UNIQUE INDEX "room_devices_room_id_device_id_key" ON "room_devices"("room_id", "device_id");

-- CreateIndex
CREATE UNIQUE INDEX "access_points_home_id_access_point_name_key" ON "access_points"("home_id", "access_point_name");

-- CreateIndex
CREATE INDEX "IX_access_events_event_time" ON "access_events"("event_time" DESC);

-- CreateIndex
CREATE INDEX "IX_access_events_user_event_time" ON "access_events"("user_id", "event_time" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "light_zones_room_id_zone_name_key" ON "light_zones"("room_id", "zone_name");

-- CreateIndex
CREATE UNIQUE INDEX "light_zones_relay_device_id_relay_channel_no_key" ON "light_zones"("relay_device_id", "relay_channel_no");

-- CreateIndex
CREATE INDEX "IX_light_commands_zone_requested_at" ON "light_commands"("light_zone_id", "requested_at" DESC);

-- CreateIndex
CREATE INDEX "IX_light_events_zone_event_time" ON "light_events"("light_zone_id", "event_time" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "heating_loops_room_id_loop_name_key" ON "heating_loops"("room_id", "loop_name");

-- CreateIndex
CREATE UNIQUE INDEX "heating_loops_temp_sensor_device_id_key" ON "heating_loops"("temp_sensor_device_id");

-- CreateIndex
CREATE UNIQUE INDEX "heating_loops_valve_device_id_key" ON "heating_loops"("valve_device_id");

-- CreateIndex
CREATE UNIQUE INDEX "heating_profiles_heating_loop_id_profile_name_key" ON "heating_profiles"("heating_loop_id", "profile_name");

-- CreateIndex
CREATE UNIQUE INDEX "heating_schedule_entries_heating_profile_id_day_type_sequen_key" ON "heating_schedule_entries"("heating_profile_id", "day_type", "sequence_no");

-- CreateIndex
CREATE INDEX "IX_temperature_readings_loop_sampled_at" ON "temperature_readings"("heating_loop_id", "sampled_at" DESC);

-- CreateIndex
CREATE INDEX "IX_heating_demands_loop_evaluated_at" ON "heating_demands"("heating_loop_id", "evaluated_at" DESC);

-- CreateIndex
CREATE INDEX "IX_valve_events_loop_event_time" ON "valve_events"("heating_loop_id", "event_time" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "boiler_controller_home_id_key" ON "boiler_controller"("home_id");

-- CreateIndex
CREATE UNIQUE INDEX "boiler_controller_relay_device_id_key" ON "boiler_controller"("relay_device_id");

-- CreateIndex
CREATE INDEX "IX_boiler_events_event_time" ON "boiler_events"("event_time" DESC);

-- CreateIndex
CREATE INDEX "IX_device_status_log_device_time" ON "device_status_log"("device_id", "status_time" DESC);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_home_id_fkey" FOREIGN KEY ("home_id") REFERENCES "homes"("home_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_home_id_fkey" FOREIGN KEY ("home_id") REFERENCES "homes"("home_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_devices" ADD CONSTRAINT "user_devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_devices" ADD CONSTRAINT "user_devices_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("device_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_home_id_fkey" FOREIGN KEY ("home_id") REFERENCES "homes"("home_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_devices" ADD CONSTRAINT "room_devices_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("room_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_devices" ADD CONSTRAINT "room_devices_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("device_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_points" ADD CONSTRAINT "access_points_home_id_fkey" FOREIGN KEY ("home_id") REFERENCES "homes"("home_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_points" ADD CONSTRAINT "access_points_esp32_device_id_fkey" FOREIGN KEY ("esp32_device_id") REFERENCES "devices"("device_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_points" ADD CONSTRAINT "access_points_lock_device_id_fkey" FOREIGN KEY ("lock_device_id") REFERENCES "devices"("device_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_events" ADD CONSTRAINT "access_events_access_point_id_fkey" FOREIGN KEY ("access_point_id") REFERENCES "access_points"("access_point_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_events" ADD CONSTRAINT "access_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_events" ADD CONSTRAINT "access_events_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("device_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presence_status" ADD CONSTRAINT "presence_status_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presence_status" ADD CONSTRAINT "presence_status_last_access_event_id_fkey" FOREIGN KEY ("last_access_event_id") REFERENCES "access_events"("access_event_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "light_zones" ADD CONSTRAINT "light_zones_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("room_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "light_zones" ADD CONSTRAINT "light_zones_relay_device_id_fkey" FOREIGN KEY ("relay_device_id") REFERENCES "devices"("device_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "light_commands" ADD CONSTRAINT "light_commands_light_zone_id_fkey" FOREIGN KEY ("light_zone_id") REFERENCES "light_zones"("light_zone_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "light_commands" ADD CONSTRAINT "light_commands_requested_by_user_id_fkey" FOREIGN KEY ("requested_by_user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "light_events" ADD CONSTRAINT "light_events_light_zone_id_fkey" FOREIGN KEY ("light_zone_id") REFERENCES "light_zones"("light_zone_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "light_events" ADD CONSTRAINT "light_events_command_id_fkey" FOREIGN KEY ("command_id") REFERENCES "light_commands"("light_command_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "light_events" ADD CONSTRAINT "light_events_source_device_id_fkey" FOREIGN KEY ("source_device_id") REFERENCES "devices"("device_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "light_events" ADD CONSTRAINT "light_events_triggered_by_user_id_fkey" FOREIGN KEY ("triggered_by_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "heating_loops" ADD CONSTRAINT "heating_loops_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("room_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "heating_loops" ADD CONSTRAINT "heating_loops_temp_sensor_device_id_fkey" FOREIGN KEY ("temp_sensor_device_id") REFERENCES "devices"("device_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "heating_loops" ADD CONSTRAINT "heating_loops_valve_device_id_fkey" FOREIGN KEY ("valve_device_id") REFERENCES "devices"("device_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "heating_profiles" ADD CONSTRAINT "heating_profiles_heating_loop_id_fkey" FOREIGN KEY ("heating_loop_id") REFERENCES "heating_loops"("heating_loop_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "heating_schedule_entries" ADD CONSTRAINT "heating_schedule_entries_heating_profile_id_fkey" FOREIGN KEY ("heating_profile_id") REFERENCES "heating_profiles"("heating_profile_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "heating_overrides" ADD CONSTRAINT "heating_overrides_heating_loop_id_fkey" FOREIGN KEY ("heating_loop_id") REFERENCES "heating_loops"("heating_loop_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "heating_overrides" ADD CONSTRAINT "heating_overrides_requested_by_user_id_fkey" FOREIGN KEY ("requested_by_user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "heating_overrides" ADD CONSTRAINT "heating_overrides_target_profile_id_fkey" FOREIGN KEY ("target_profile_id") REFERENCES "heating_profiles"("heating_profile_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temperature_readings" ADD CONSTRAINT "temperature_readings_heating_loop_id_fkey" FOREIGN KEY ("heating_loop_id") REFERENCES "heating_loops"("heating_loop_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temperature_readings" ADD CONSTRAINT "temperature_readings_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("device_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "heating_demands" ADD CONSTRAINT "heating_demands_heating_loop_id_fkey" FOREIGN KEY ("heating_loop_id") REFERENCES "heating_loops"("heating_loop_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "heating_demands" ADD CONSTRAINT "heating_demands_temperature_reading_id_fkey" FOREIGN KEY ("temperature_reading_id") REFERENCES "temperature_readings"("temperature_reading_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valve_events" ADD CONSTRAINT "valve_events_heating_loop_id_fkey" FOREIGN KEY ("heating_loop_id") REFERENCES "heating_loops"("heating_loop_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valve_events" ADD CONSTRAINT "valve_events_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("device_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boiler_controller" ADD CONSTRAINT "boiler_controller_home_id_fkey" FOREIGN KEY ("home_id") REFERENCES "homes"("home_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boiler_controller" ADD CONSTRAINT "boiler_controller_relay_device_id_fkey" FOREIGN KEY ("relay_device_id") REFERENCES "devices"("device_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boiler_events" ADD CONSTRAINT "boiler_events_boiler_controller_id_fkey" FOREIGN KEY ("boiler_controller_id") REFERENCES "boiler_controller"("boiler_controller_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boiler_events" ADD CONSTRAINT "boiler_events_trigger_loop_id_fkey" FOREIGN KEY ("trigger_loop_id") REFERENCES "heating_loops"("heating_loop_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_status_log" ADD CONSTRAINT "device_status_log_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("device_id") ON DELETE RESTRICT ON UPDATE CASCADE;
