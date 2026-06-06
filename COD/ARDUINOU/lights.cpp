#include "lights.h"
#include "types.h"
#include "config.h"

static inline int lightPin(int roomIndex) {
#if SIMULATE_LIGHTS
    return roomIndex == 0 ? PIN_LIGHT_1_SIM : PIN_LIGHT_2_SIM;
#else
    return roomIndex == 0 ? PIN_LIGHT_1_RELAY : PIN_LIGHT_2_RELAY;
#endif
}


void initLights() {
    for (int i = 0; i < ROOM_COUNT; i++) {
        pinMode(lightPin(i), OUTPUT);
        digitalWrite(lightPin(i), LOW);
    }

#if SIMULATE_LIGHTS
    Serial.println("[LIGHTS] Running in simulation mode (LEDs).");
#else
    Serial.println("[LIGHTS] Real relay outputs initialized.");
#endif
}


void setLight(int roomIndex, bool state) {
    if (roomIndex < 0 || roomIndex >= ROOM_COUNT) return;
    rooms[roomIndex].lightState = state;
    digitalWrite(lightPin(roomIndex), state ? HIGH : LOW);
    Serial.printf("[LIGHTS] Room %d (zone %d) → %s\n",
        rooms[roomIndex].id, rooms[roomIndex].zoneId, state ? "ON" : "OFF");
}
