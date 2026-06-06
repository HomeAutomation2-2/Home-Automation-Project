#pragma once

// ─── Simulation flags ─────────────────────────────────────────────────────────
// Set to false to use real hardware for each subsystem independently
#define SIMULATE_SENSORS  true   // true = random values | false = real DHT11
#define SIMULATE_HEATING  true   // true = LEDs          | false = real relays
#define SIMULATE_LIGHTS   true   // true = LEDs          | false = real relays
#define SIMULATE_BOILER   true   // true = LED           | false = real relay

// ─── BLE UUIDs ────────────────────────────────────────────────────────────────
#define SERVICE_UUID     "0000180a-0000-1000-8000-00805f9b34fb"
#define WRITE_CHAR_UUID  "00002a29-0000-1000-8000-00805f9b34fb"
#define NOTIFY_CHAR_UUID "00002a28-0000-1000-8000-00805f9b34fb"

// ─── Network ──────────────────────────────────────────────────────────────────
#define WIFI_SSID      "NothingHere"
#define WIFI_PASS      "8689013472"
#define SERVER_URL     "http://192.168.1.112:3000"
#define DEVICE_SECRET  "secret"

// ─── Simulated pins (LEDs) ────────────────────────────────────────────────────
#define PIN_BOILER_SIM    2
#define PIN_LIGHT_1_SIM   4
#define PIN_LIGHT_2_SIM   5
#define PIN_HEATING_1_SIM 12
#define PIN_HEATING_2_SIM 13

// ─── Real hardware pins ───────────────────────────────────────────────────────
// Temperature sensors (DHT11 data pins)
#define PIN_TEMP_1  18
#define PIN_TEMP_2  19

// Heating electrovalve relays (one per room)
#define PIN_HEATING_1_RELAY 12
#define PIN_HEATING_2_RELAY 13

// Boiler relay
#define PIN_BOILER_RELAY 14

// Light relays (one per zone)
#define PIN_LIGHT_1_RELAY 15
#define PIN_LIGHT_2_RELAY 16

// ─── Limits ───────────────────────────────────────────────────────────────────
#define MAX_USERS   20
#define ROOM_COUNT  2
