#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WebServer.h>
#include <ESPmDNS.h>
#include <ArduinoJson.h>
#include "ble.h"
#include "config.h"



struct Room {
    int   id;
    float currentTemp;
    float targetTemp;
    bool  isHeating;
    int   zoneId;
    bool  lightState;
    float offset;
};

Room    rooms[ROOM_COUNT];
String  allowedHashes[MAX_USERS];
int     totalUsers     = 0;
float   hysteresis     = 0.5;
int     samplingPeriod = 60; 
bool    boilerState    = false;

static unsigned long lastSensorPush = 0;
WebServer espServer(80);
static HTTPClient http;

static const char* headerKeys[]     = { "x-device-secret" };
static const size_t headerKeysCount = sizeof(headerKeys) / sizeof(headerKeys[0]);




/*
    The core heating logic. It runs every time a remote temperature sensor updates or the main loop interval ticks 
    to determine whether the boiler should be turned on or off. If any of the rooms are under the target temperature,
    the boiler turns on.
*/
void updateHeating() 
{
    bool anyHeating = false;

    Serial.println("[HEATING] Evaluating thermal conditions...");
    
    for (int i = 0; i < ROOM_COUNT; i++) 
    {
        if (rooms[i].targetTemp == 0) 
        {
            rooms[i].isHeating = false;
            continue;
        }
        
        float adjustedTemp = rooms[i].currentTemp + rooms[i].offset;
        
        if (adjustedTemp < (rooms[i].targetTemp - hysteresis)) 
        {
            rooms[i].isHeating = true;
        } 
        else if (adjustedTemp >= rooms[i].targetTemp) 
        {
            rooms[i].isHeating = false;
        }
        
        if (rooms[i].isHeating) 
            anyHeating = true;

        Serial.printf("[HEATING] Room %d (Target: %.2f°C | Current+Offset: %.2f°C) -> Heating: %s\n", 
            rooms[i].id, rooms[i].targetTemp, adjustedTemp, rooms[i].isHeating ? "ON" : "OFF");
    }
    
    boilerState = anyHeating;

    Serial.printf("[HEATING] Global boiler system status evaluated -> %s\n", boilerState ? "ON" : "OFF");
}



/*
    Send a HTTP POST message to the server.
*/
void httpPost(const char* path, String& body, String* responseOut = nullptr) 
{
    String url = String(SERVER_URL) + path;
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-device-secret", DEVICE_SECRET);

    int code = http.POST(body);

    Serial.printf("[HTTP SERVER-OUT] POST %s -> HTTP Code: %d\n", path, code);

    if (responseOut && (code == 200 || code == 201)) 
    {
        *responseOut = http.getString();
    }

    http.end();
}



/*
    Connect to WiFi and try connecting to the server to register the deivce and perform a handshake.

    The data received during the handshake is:
    {
        hysteresis: number
        bt_codes: string[]
        sampling_period: number
        lights: {
            zone_id: number
            state: boolean
        }[]
        rooms: {
            id: number
            target_temp: number
            offset: number
        }[]
    }
*/
void connectWiFiAndRegister() 
{
    Serial.print("[Wi-Fi] Connecting to network...");

    WiFi.begin(WIFI_SSID, WIFI_PASS);

    while (WiFi.status() != WL_CONNECTED) 
    {
        delay(500);
        Serial.print(".");
    }

    Serial.printf("\n[Wi-Fi] Connected. Local Node IP: %s\n", WiFi.localIP().toString().c_str());

    JsonDocument doc;
    doc["ip"]     = WiFi.localIP().toString();
    doc["secret"] = DEVICE_SECRET;

    String body, response;
    serializeJson(doc, body);
    httpPost("/devices/register", body, &response);

    if (response.isEmpty()) 
    {
        Serial.println("[ERROR] Cloud platform handshake verification failed.");
        return;
    }

    doc.clear();
    DeserializationError err = deserializeJson(doc, response);
    if (err) 
    {
        Serial.printf("[ERROR] Cloud JSON parsing runtime error: %s\n", err.c_str());
        return;
    }

    totalUsers = 0;
    for (JsonVariant v : doc["bt_codes"].as<JsonArray>()) 
    {
        if (totalUsers >= MAX_USERS) break;
        allowedHashes[totalUsers++] = v.as<String>();
    }

    Serial.printf("[SYSTEM] Registered: %d access tokens parsed.\n", totalUsers);

    hysteresis     = doc["hysteresis"].as<float>();
    samplingPeriod = doc["sampling_period"].as<int>();

    Serial.printf("[SYSTEM] Parameters synced. Hysteresis: %.2f, Baseline Dynamic Interval: %ds\n", hysteresis, samplingPeriod);

    for (JsonVariant v : doc["lights"].as<JsonArray>()) 
    {
        int  zoneId = v["zone_id"].as<int>();
        bool state  = v["state"].as<bool>();

        for (int i = 0; i < ROOM_COUNT; i++) 
        {
            if (rooms[i].zoneId == zoneId) 
            { 
                rooms[i].lightState = state;

                Serial.printf("[LIGHTS] Zone %d set to %s from configuration\n", zoneId, state ? "ON" : "OFF");
            }
        }
    }

    for (JsonVariant v : doc["rooms"].as<JsonArray>()) 
    {
        int   id     = v["id"].as<int>();
        float target = v["target_temp"].as<float>();
        float offset = v["offset"].as<float>();

        for (int i = 0; i < ROOM_COUNT; i++) 
        {
            if (rooms[i].id == id) 
            {
                rooms[i].targetTemp = target;
                rooms[i].offset     = offset;
            }
        }
    }
}



/*
    Send the temerature sensor data back to the server.
*/
void sendSensorData() 
{
    if (WiFi.status() != WL_CONNECTED) 
        return;

    JsonDocument doc;
    JsonArray roomsArray = doc["rooms"].to<JsonArray>();
    for (int i = 0; i < ROOM_COUNT; i++) 
    {
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



/*
    Check if the sender has the same secret code as the ESP
*/
static bool isAuthorized() 
{ 
    return espServer.header("x-device-secret") == DEVICE_SECRET; 
}



/*
    Send an "Unauthorized" response back
*/
static void sendUnauthorized() 
{ 
    espServer.send(401, "application/json", "{\"error\":\"Unauthorized\"}"); 
}



/*
    Disable CORS.
*/
static void sendCorsPreflightOk() 
{ 
    espServer.sendHeader("Access-Control-Allow-Origin", "*"); 
    espServer.sendHeader("Access-Control-Allow-Headers", "*"); 
    espServer.send(204); 
}



/*
    Handle an incoming message from one of the other ESPs.
*/
static void handleNodeInbound() 
{
    String body = espServer.arg("plain");
    JsonDocument doc;

    if (deserializeJson(doc, body)) 
    { 
        espServer.send(400, "application/json", "{\"error\":\"Invalid JSON\"}");

        return; 
    }
    
    String type = doc["type"];
    // if (type == "button") 
    // {
    //     rooms[0].lightState = !rooms[0].lightState;

    //     Serial.printf("[NODE INBOUND] Physical toggle received. Room 1 Light state updated to: %s\n", rooms[0].lightState ? "ON" : "OFF");

    //     espServer.send(200, "application/json", "{\"status\":\"ok\"}");
    // } 
    if (type == "button") 
    {
        Serial.println("[NODE INBOUND] Physical button press detected via ESP01. Forwarding to backend server...");
        
        JsonDocument serverDoc;
        serverDoc["zone_id"] = rooms[0].zoneId;
        
        String serverBody;
        serializeJson(serverDoc, serverBody);
        
        if (WiFi.status() == WL_CONNECTED) 
        {
            HTTPClient outboundHttp;
            String targetUrl = String(SERVER_URL) + "/light-zones/toggle";
            
            outboundHttp.begin(targetUrl);
            outboundHttp.addHeader("Content-Type", "application/json");
            outboundHttp.addHeader("x-device-secret", DEVICE_SECRET); 
            
            int httpCode = outboundHttp.POST(serverBody);
            Serial.printf("[SERVER PROXY] POST /light-zones/toggle -> Response Code: %d\n", httpCode);
            outboundHttp.end();
        } 
        else 
        {
            Serial.println("[ERROR] Cannot sync button toggle: Wi-Fi disconnected.");
        }

        rooms[0].lightState = !rooms[0].lightState;
        Serial.printf("[LOCAL STATE] Predicted state for Room 1 Light: %s\n", rooms[0].lightState ? "ON" : "OFF");
        
        espServer.send(200, "application/json", "{\"status\":\"ok\"}");
    }
    else if (type == "sensor") 
    {
        String deviceId = doc["device_id"];
        float t = doc["temp"];
        int idx = (deviceId == "ESP01_DHT11_ROOM2") ? 1 : 0;
        
        rooms[idx].currentTemp = t;

        Serial.printf("[NODE INBOUND] Temperature packet parsed. Source: %s | Raw Value: %.2f°C\n", deviceId.c_str(), t);
        
        updateHeating();
        
        JsonDocument res;
        res["interval"] = samplingPeriod * 1000;
        String out;
        serializeJson(res, out);
        
        espServer.send(200, "application/json", out);
    }
}



/*
    Send the home status back to the server.
*/
static void handleNodeOutbound() 
{
    JsonDocument res;
    res["light_zone1"] = rooms[0].lightState; 
    res["boiler"]      = boilerState;
    String out;
    serializeJson(res, out);

    espServer.send(200, "application/json", out);
}



/*
    Handle BT code update from the server.
 */
static void handleUpdateCodes() 
{
    if (espServer.method() == HTTP_OPTIONS) 
    { 
        sendCorsPreflightOk(); 
        return; 
    }
    
    if (!isAuthorized())
    { 
        sendUnauthorized();
        return; 
    }

    String body = espServer.arg("plain");
    JsonDocument doc;
    if (deserializeJson(doc, body))
    { 
        espServer.send(400, "application/json", "{\"error\":\"Invalid JSON\"}"); 
        return; 
    }

    totalUsers = 0;
    for (JsonVariant v : doc["bt_codes"].as<JsonArray>()) 
    {
        if (totalUsers >= MAX_USERS) 
            break;

        allowedHashes[totalUsers++] = v.as<String>();
    }

    Serial.printf("[REMOTE CONFIG] Security profile updated. Load count: %d codes.\n", totalUsers);
    
    espServer.send(200, "application/json", "{\"status\":\"ok\"}");
}



/*
    Handle a lights change event from the server
*/
static void handleLight() 
{
    if (espServer.method() == HTTP_OPTIONS)
    { 
        sendCorsPreflightOk(); 
        return; 
    }
    
    if (!isAuthorized())
    { 
        sendUnauthorized();
        return; 
    }

    String body = espServer.arg("plain");
    JsonDocument doc;
    if (deserializeJson(doc, body))
    { 
        espServer.send(400, "application/json", "{\"error\":\"Invalid JSON\"}"); 
        return; 
    }

    int zoneId = doc["zone_id"].as<int>();
    bool state = doc["state"].as<bool>();
    int found = -1;
    for (int i = 0; i < ROOM_COUNT; i++) 
    { 
        if (rooms[i].zoneId == zoneId) 
        { 
            found = i; 
            break; 
        } 
    }

    if (found == -1) 
    { 
        espServer.send(404, "application/json", "{\"error\":\"Zone not found\"}"); 
        return; 
    }
    
    rooms[found].lightState = state;
    
    Serial.printf("[REMOTE CONFIG] Light transaction executed. Zone: %d set to %s\n", zoneId, state ? "ON" : "OFF");
    
    JsonDocument res;
    res["zone_id"] = zoneId;
    res["state"] = state;
    
    String out;
    serializeJson(res, out);
    espServer.send(200, "application/json", out);
}



/*
    Handle target temperature update from the server.
*/
static void handleTargetTemp() 
{
    if (espServer.method() == HTTP_OPTIONS) 
    { 
        sendCorsPreflightOk(); 
        return; 
    }

    if (!isAuthorized())
    { 
        sendUnauthorized();
        return;
    }

    String body = espServer.arg("plain");
    JsonDocument doc;
    if (deserializeJson(doc, body)) 
    { 
        espServer.send(400, "application/json", "{\"error\":\"Invalid JSON\"}"); 
        return; 
    }

    for (JsonVariant v : doc["rooms"].as<JsonArray>()) 
    {
        int id = v["id"].as<int>();

        for (int i = 0; i < ROOM_COUNT; i++) 
        {
            if (rooms[i].id == id) 
            {
                rooms[i].targetTemp = v["target_temp"].as<float>();
                rooms[i].offset     = v["offset"].as<float>();
            
                Serial.printf("[REMOTE CONFIG] Room %d Metrics -> Target: %.2f°C | Offset: %.2f°C\n", id, rooms[i].targetTemp, rooms[i].offset);
            }
        }
    }

    updateHeating();
    
    JsonDocument res;
    res["boiler"] = boilerState;
    
    String out;
    serializeJson(res, out);
    espServer.send(200, "application/json", out);
}



/*
    Handle settings update from server.
*/
static void handleSettings() 
{
    if (espServer.method() == HTTP_OPTIONS)
    { 
        sendCorsPreflightOk(); 
        return; 
    }

    if (!isAuthorized())
    { 
        sendUnauthorized();
        return; 
    }

    String body = espServer.arg("plain");
    JsonDocument doc;
    if (deserializeJson(doc, body)) 
    { 
        espServer.send(400, "application/json", "{\"error\":\"Invalid JSON\"}"); 
        return; 
    }
    
    if (doc["hysteresis"].is<float>())
        hysteresis = doc["hysteresis"].as<float>();
    if (doc["sampling_period"].is<int>())
        samplingPeriod = doc["sampling_period"].as<int>();
    
    Serial.printf("[REMOTE CONFIG] Global parameters updated. Hysteresis: %.2f, Period: %ds\n", hysteresis, samplingPeriod);
    
    espServer.send(200, "application/json", "{\"status\":\"ok\"}");
}



/*
    Handle log message from other ESPs.
*/
static void handleNodeLog() 
{
    String body = espServer.arg("plain");
    JsonDocument doc;
    if (deserializeJson(doc, body)) 
    { 
        espServer.send(400, "application/json", "{\"error\":\"Invalid JSON\"}"); 
        return; 
    }

    Serial.printf("[REMOTE ESP01 LOG][%s] %s\n", (const char*)(doc["device"]|"UNK"), (const char*)(doc["msg"]|""));
    
    espServer.send(200, "application/json", "{\"status\":\"logged\"}");
}



/*
    Sets up the local HTTP server.
*/
void setupEspServer() 
{
    espServer.on("/node/inbound",  HTTP_POST, handleNodeInbound);
    espServer.on("/node/outbound", HTTP_GET,  handleNodeOutbound);
    espServer.on("/node/log",      HTTP_POST, handleNodeLog);
    espServer.on("/update-codes",  HTTP_ANY,  handleUpdateCodes);
    espServer.on("/light",         HTTP_ANY,  handleLight);
    espServer.on("/target-temp",   HTTP_ANY,  handleTargetTemp);
    espServer.on("/settings",      HTTP_ANY,  handleSettings);

    espServer.collectHeaders(headerKeys, headerKeysCount);
    espServer.begin();
    
    Serial.println("[SYSTEM] Local HTTP Node API Listening via mDNS mapping.");
}



void setup() 
{
    Serial.begin(115200);
    randomSeed(analogRead(0));

    // for the door LED
    pinMode(PIN_DOOR_LED, OUTPUT);
    digitalWrite(PIN_DOOR_LED, LOW);

    rooms[0] = { 1, 0.0, 0.0, false, 1, false, 0.0 };
    rooms[1] = { 2, 0.0, 0.0, false, 2, false, 0.0 };

    connectWiFiAndRegister();
    
    if (MDNS.begin("smartlock")) 
    {
        Serial.println("[mDNS] Responder active at http://smartlock.local");
    }

    setupEspServer();
    setupBLE();
}



void loop() 
{
    espServer.handleClient();

    static bool lastDoorVisualState = false;
    if (isDoorOpened != lastDoorVisualState) 
    {
        lastDoorVisualState = isDoorOpened;
        digitalWrite(PIN_DOOR_LED, isDoorOpened ? HIGH : LOW);
        
        Serial.printf("[SECURITY] Indicator updated. Door status: %s\n", isDoorOpened ? "OPENED (LED ON)" : "CLOSED (LED OFF)");
    }

    unsigned long now = millis();
    if (now - lastSensorPush >= (unsigned long)samplingPeriod * 1000) 
    {
        lastSensorPush = now;
        sendSensorData();
    }
}