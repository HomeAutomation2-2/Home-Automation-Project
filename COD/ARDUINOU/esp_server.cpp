#include "esp_server.h"
#include "types.h"
#include "config.h"
#include "lights.h"
#include "sensors.h"
#include "heating.h"
#include <ArduinoJson.h>

WebServer espServer(80);

static const char* headerKeys[]     = { "x-device-secret" };
static const size_t headerKeysCount = sizeof(headerKeys) / sizeof(headerKeys[0]);


// ─── Auth check helper ────────────────────────────────────────────────────────

static bool isAuthorized() {
    return espServer.header("x-device-secret") == DEVICE_SECRET;
}

static void sendUnauthorized() {
    Serial.printf("[WARN] Unauthorized request. Secret: %s\n",
        espServer.header("x-device-secret").c_str());
    espServer.send(401, "application/json", "{\"error\":\"Unauthorized\"}");
}

static void sendCorsPreflightOk() {
    espServer.sendHeader("Access-Control-Allow-Origin", "*");
    espServer.sendHeader("Access-Control-Allow-Headers", "*");
    espServer.send(204);
}


// ─── Endpoint handlers ────────────────────────────────────────────────────────

static void handleUpdateCodes() {
    if (espServer.method() == HTTP_OPTIONS) { sendCorsPreflightOk(); return; }
    if (!isAuthorized())                    { sendUnauthorized();     return; }

    String body = espServer.arg("plain");
    Serial.println("[HTTP] /update-codes: " + body);

    JsonDocument doc;
    if (deserializeJson(doc, body)) {
        espServer.send(400, "application/json", "{\"error\":\"Invalid JSON\"}");
        return;
    }

    totalUsers = 0;
    for (JsonVariant v : doc["bt_codes"].as<JsonArray>()) {
        if (totalUsers >= MAX_USERS) { Serial.println("[WARN] Max users reached!"); break; }
        allowedHashes[totalUsers++] = v.as<String>();
    }

    Serial.printf("[OK] BT codes updated. %d codes stored.\n", totalUsers);
    espServer.send(200, "application/json", "{\"status\":\"ok\"}");
}


static void handleLight() {
    if (espServer.method() == HTTP_OPTIONS) { sendCorsPreflightOk(); return; }
    if (!isAuthorized())                    { sendUnauthorized();     return; }

    String body = espServer.arg("plain");
    Serial.println("[HTTP] /light: " + body);

    JsonDocument doc;
    if (deserializeJson(doc, body)) {
        espServer.send(400, "application/json", "{\"error\":\"Invalid JSON\"}");
        return;
    }

    int  zoneId = doc["zone_id"].as<int>();
    bool state  = doc["state"].as<bool>();
    int  found  = -1;

    for (int i = 0; i < ROOM_COUNT; i++) {
        if (rooms[i].zoneId == zoneId) { found = i; break; }
    }

    if (found == -1) {
        espServer.send(404, "application/json", "{\"error\":\"Zone not found\"}");
        return;
    }

    setLight(found, state);

    JsonDocument res;
    res["zone_id"] = zoneId;
    res["state"]   = state;
    String out;
    serializeJson(res, out);
    espServer.send(200, "application/json", out);
}


static void handleTargetTemp() {
    if (espServer.method() == HTTP_OPTIONS) { sendCorsPreflightOk(); return; }
    if (!isAuthorized())                    { sendUnauthorized();     return; }

    String body = espServer.arg("plain");
    Serial.println("[HTTP] /target-temp: " + body);

    JsonDocument doc;
    if (deserializeJson(doc, body)) {
        espServer.send(400, "application/json", "{\"error\":\"Invalid JSON\"}");
        return;
    }

    for (JsonVariant v : doc["rooms"].as<JsonArray>()) {
        int   id     = v["id"].as<int>();
        float temp   = v["target_temp"].as<float>();
        float offset = v["offset"].as<float>();

        for (int i = 0; i < ROOM_COUNT; i++) {
            if (rooms[i].id == id) {
                rooms[i].targetTemp = temp;
                rooms[i].offset     = offset;
                Serial.printf("[TEMP] Room %d target → %.2f°C | offset → %.2f\n", id, temp, offset);
            }
        }
    }

    readSensors();
    updateHeating();

    JsonDocument res;
    res["boiler"] = boilerState;
    String out;
    serializeJson(res, out);
    espServer.send(200, "application/json", out);
}


static void handleSettings() {
    if (espServer.method() == HTTP_OPTIONS) { sendCorsPreflightOk(); return; }
    if (!isAuthorized())                    { sendUnauthorized();     return; }

    String body = espServer.arg("plain");
    Serial.println("[HTTP] /settings: " + body);

    JsonDocument doc;
    if (deserializeJson(doc, body)) {
        espServer.send(400, "application/json", "{\"error\":\"Invalid JSON\"}");
        return;
    }

    if (doc["hysteresis"].is<float>()) {
        hysteresis = doc["hysteresis"].as<float>();
        Serial.printf("[SETTINGS] Hysteresis → %.2f\n", hysteresis);
    }

    if (doc["sampling_period"].is<int>()) {
        samplingPeriod = doc["sampling_period"].as<int>();
        Serial.printf("[SETTINGS] Sampling period → %ds\n", samplingPeriod);
    }

    espServer.send(200, "application/json", "{\"status\":\"ok\"}");
}


// ─── Setup ────────────────────────────────────────────────────────────────────

void setupEspServer() {
    espServer.on("/update-codes", HTTP_ANY,  handleUpdateCodes);
    espServer.on("/light",        HTTP_ANY,  handleLight);
    espServer.on("/target-temp",  HTTP_ANY,  handleTargetTemp);
    espServer.on("/settings",     HTTP_ANY,  handleSettings);

    espServer.collectHeaders(headerKeys, headerKeysCount);
    espServer.begin();

    Serial.println("[HTTP] ESP server listening on port 80.");
}
