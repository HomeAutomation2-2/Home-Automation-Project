#include "heating.h"
#include "types.h"
#include "config.h"

// Pin helpers — resolves to sim or real pin per subsystem flag
static inline int heatingPin(int roomIndex) {
#if SIMULATE_HEATING
    return roomIndex == 0 ? PIN_HEATING_1_SIM : PIN_HEATING_2_SIM;
#else
    return roomIndex == 0 ? PIN_HEATING_1_RELAY : PIN_HEATING_2_RELAY;
#endif
}

static inline int boilerPin() {
#if SIMULATE_BOILER
    return PIN_BOILER_SIM;
#else
    return PIN_BOILER_RELAY;
#endif
}


void initHeating() {
    for (int i = 0; i < ROOM_COUNT; i++) {
        pinMode(heatingPin(i), OUTPUT);
        digitalWrite(heatingPin(i), LOW);
    }
    pinMode(boilerPin(), OUTPUT);
    digitalWrite(boilerPin(), LOW);

#if SIMULATE_HEATING
    Serial.println("[HEATING] Running in simulation mode (LEDs).");
#else
    Serial.println("[HEATING] Real relay outputs initialized.");
#endif
}


void updateHeating() {
    bool anyHeating = false;

    for (int i = 0; i < ROOM_COUNT; i++) {
        if (rooms[i].targetTemp == 0) {
            rooms[i].isHeating = false;
            digitalWrite(heatingPin(i), LOW);
            continue;
        }

        // Bipositional hysteresis loop
        if (rooms[i].currentTemp < rooms[i].targetTemp - hysteresis) {
            rooms[i].isHeating = true;
        } else if (rooms[i].currentTemp >= rooms[i].targetTemp) {
            rooms[i].isHeating = false;
        }
        // Between the bands: keep previous state (hysteresis)

        digitalWrite(heatingPin(i), rooms[i].isHeating ? HIGH : LOW);

        if (rooms[i].isHeating) anyHeating = true;
    }

    boilerState = anyHeating;
    digitalWrite(boilerPin(), boilerState ? HIGH : LOW);

    Serial.printf("[HEATING] Room %d: %s | Room %d: %s | Boiler: %s\n",
        rooms[0].id, rooms[0].isHeating ? "ON" : "OFF",
        rooms[1].id, rooms[1].isHeating ? "ON" : "OFF",
        boilerState ? "ON" : "OFF");
}
