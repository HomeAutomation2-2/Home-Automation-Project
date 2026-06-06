#include "sensors.h"
#include "types.h"
#include "config.h"

// ─── Real sensor driver ───────────────────────────────────────────────────────
// To enable: set SIMULATE_SENSORS to false in config.h
// Then install the "DHT sensor library" by Adafruit in Arduino IDE
// and uncomment the lines below.
//
// #include <DHT.h>
// #define DHT_TYPE DHT11
// DHT dht1(PIN_TEMP_1, DHT_TYPE);
// DHT dht2(PIN_TEMP_2, DHT_TYPE);


void initSensors() {
#if !SIMULATE_SENSORS
    // dht1.begin();
    // dht2.begin();
    Serial.println("[SENSORS] Real DHT11 sensors initialized.");
#else
    Serial.println("[SENSORS] Running in simulation mode.");
#endif
}


void readSensors() {
    for (int i = 0; i < ROOM_COUNT; i++) {
#if SIMULATE_SENSORS
        // Simulated: room 0 runs cooler, room 1 runs warmer
        float base = (i == 0) ? random(1600, 1901) / 100.0
                               : random(2100, 2501) / 100.0;
        rooms[i].currentTemp = base + rooms[i].offset;
#else
        // Real DHT11 reading
        // float raw = (i == 0) ? dht1.readTemperature()
        //                       : dht2.readTemperature();
        //
        // if (isnan(raw)) {
        //     Serial.printf("[SENSORS] Failed to read room %d sensor!\n", rooms[i].id);
        //     // Keep previous value on failure rather than corrupting the loop
        // } else {
        //     rooms[i].currentTemp = raw + rooms[i].offset;
        // }
#endif
    }

    Serial.printf("[SENSORS] Room %d: %.2f°C | Room %d: %.2f°C\n",
        rooms[0].id, rooms[0].currentTemp,
        rooms[1].id, rooms[1].currentTemp);
}
