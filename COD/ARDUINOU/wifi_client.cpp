#include "wifi_client.h"
#include "types.h"
#include "config.h"
#include "lights.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

static HTTPClient http;


void httpPost(const char* path, String& body, String* responseOut) {
    String url = String(SERVER_URL) + path;
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-device-secret", DEVICE_SECRET);

    int code = http.POST(body);
    Serial.printf("[HTTP] POST %s → %d\n", path, code);

    if (responseOut && (code == 200 || code == 201)) {
        *responseOut = http.getString();
    }

    http.end();
}


void connectWiFiAndRegister() {
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    Serial.print("[Wi-Fi] Connecting...");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println();
    Serial.print("[Wi-Fi] Connected. IP: ");
    Serial.println(WiFi.localIP());

    JsonDocument doc;
    doc["ip"]     = WiFi.localIP().toString();
    doc["secret"] = DEVICE_SECRET;

    String body, response;
    serializeJson(doc, body);
    httpPost("/devices/register", body, &response);

    if (response.isEmpty()) {
        Serial.println("[ERROR] Handshake failed, no response.");
        return;
    }

    Serial.println("[HTTP] Handshake response: " + response);

    doc.clear();
    DeserializationError err = deserializeJson(doc, response);
    if (err) {
        Serial.printf("[ERROR] Handshake JSON parse failed: %s\n", err.c_str());
        return;
    }

    // BT codes
    totalUsers = 0;
    for (JsonVariant v : doc["bt_codes"].as<JsonArray>()) {
        if (totalUsers >= MAX_USERS) { Serial.println("[WARN] Max users reached!"); break; }
        allowedHashes[totalUsers++] = v.as<String>();
    }
    Serial.printf("[OK] %d BT codes loaded.\n", totalUsers);

    // Settings
    hysteresis     = doc["hysteresis"].as<float>();
    samplingPeriod = doc["sampling_period"].as<int>();
    Serial.printf("[OK] Hysteresis: %.2f | Sampling: %ds\n", hysteresis, samplingPeriod);

    // Initial light states
    for (JsonVariant v : doc["lights"].as<JsonArray>()) {
        int  zoneId = v["zone_id"].as<int>();
        bool state  = v["state"].as<bool>();

        for (int i = 0; i < ROOM_COUNT; i++) {
            if (rooms[i].zoneId == zoneId) {
                setLight(i, state);
                Serial.printf("[OK] Light zone %d initial state: %s\n", zoneId, state ? "ON" : "OFF");
            }
        }
    }

    // Initial target temps and offsets
    for (JsonVariant v : doc["rooms"].as<JsonArray>()) {
        int   id     = v["id"].as<int>();
        float target = v["target_temp"].as<float>();
        float offset = v["offset"].as<float>();

        for (int i = 0; i < ROOM_COUNT; i++) {
            if (rooms[i].id == id) {
                rooms[i].targetTemp = target;
                rooms[i].offset     = offset;
                Serial.printf("[OK] Room %d target: %.2f°C | offset: %.2f\n", id, target, offset);
            }
        }
    }
}


void sendSensorData() {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("[HTTP] Wi-Fi not connected, skipping sensor push.");
        return;
    }

    JsonDocument doc;
    JsonArray roomsArray = doc["rooms"].to<JsonArray>();

    for (int i = 0; i < ROOM_COUNT; i++) {
        JsonObject room      = roomsArray.add<JsonObject>();
        room["id"]           = rooms[i].id;
        room["current_temp"] = rooms[i].currentTemp;
        room["heating"]      = rooms[i].isHeating;
    }

    doc["boiler"] = boilerState;

    String body;
    serializeJson(doc, body);
    httpPost("/devices/sensors", body);
}
