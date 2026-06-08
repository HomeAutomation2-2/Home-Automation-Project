#include "config.h"
#include "types.h"
#include "sensors.h"
#include "heating.h"
#include "lights.h"
#include "wifi_client.h"
#include "esp_server.h"
#include "ble.h"
#include <ESPmDNS.h>

Room   rooms[ROOM_COUNT];
String allowedHashes[MAX_USERS];
int    totalUsers     = 0;
float  hysteresis     = 0.5;
int    samplingPeriod = 60;
bool   isDoorOpened   = false;
bool   boilerState    = false;

static unsigned long lastSensorPush = 0;


void setup() {
    Serial.begin(115200);
    randomSeed(analogRead(0));

    // Hardcoded room + zone IDs — must match DB rows
    rooms[0] = { 1, 0.0, 0.0, false, 1, false, 0.0 };
    rooms[1] = { 2, 0.0, 0.0, false, 2, false, 0.0 };

    initHeating();
    initLights();
    initSensors();

    connectWiFiAndRegister();
    
    // Start mDNS responder for auto-discovery
    if (MDNS.begin("smartlock")) {
        Serial.println("[mDNS] Responder started. Hostname: http://smartlock.local");
    }

    readSensors();
    sendSensorData();
    setupEspServer();
    setupBLE();
}


void loop() {
    espServer.handleClient();

    unsigned long now = millis();
    if (now - lastSensorPush >= (unsigned long)samplingPeriod * 1000) {
        lastSensorPush = now;
        updateHeating();
        sendSensorData();
    }
}
