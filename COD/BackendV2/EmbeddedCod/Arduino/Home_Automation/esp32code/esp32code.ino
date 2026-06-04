#include <WiFi.h>
#include <WebServer.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// =====================================================
// BlueLock ESP32 Gateway - Hotspot/DHCP version
// =====================================================
// 1. Connect laptop + ESP32 + ESP01 nodes to "Serban Iphone".
// 2. Replace CHANGE_ME_LAPTOP_HOTSPOT_IP with the laptop Wi-Fi IP.
// 3. Upload ESP32, read its IP from Serial Monitor.
// 4. Upload LED/Relay ESP01, read their IPs, then set them below.

const char* WIFI_SSID = "Serban Iphone";
const char* WIFI_PASSWORD = "Penispenis";

const char* DEVICE_ID = "ESP32_MAIN_GATEWAY";
const char* DEVICE_TYPE = "gateway";
const char* FIRMWARE_VERSION = "hotspot-gateway-0.1";

// IMPORTANT: localhost does not work from ESP32.
// Example after connecting laptop to hotspot: http://172.20.10.5:3500
const char* BACKEND_BASE_URL = "http://CHANGE_ME_LAPTOP_HOTSPOT_IP:3500";

// Fill these after uploading LED/Relay ESP01 and reading their Serial Monitor IPs.
String LED_NODE_IP = "CHANGE_ME_LED_ESP01_IP";
String BOILER_NODE_IP = "CHANGE_ME_RELAY_ESP01_IP";

const int STATUS_LED_PIN = 2;
const unsigned long WIFI_RETRY_DELAY_MS = 500;
const unsigned long HEARTBEAT_INTERVAL_MS = 15000;
const unsigned long PENDING_FLUSH_INTERVAL_MS = 10000;

WebServer server(80);

String deviceToken = "dev-device-token";
String lightState = "LOW";

float tempRoom1 = 0.0;
float tempRoom2 = 0.0;
float targetRoom1 = 21.0;
float targetRoom2 = 21.0;
float hysteresis = 0.5;
bool boilerOn = false;
unsigned long sensorIntervalMs = 20000;
unsigned long lastHeartbeatAt = 0;
unsigned long lastPendingFlushAt = 0;

bool isBackendConfigured() {
  return String(BACKEND_BASE_URL).indexOf("CHANGE_ME") < 0;
}

bool isNodeConfigured(const String& nodeIp) {
  return nodeIp.indexOf("CHANGE_ME") < 0 && nodeIp.length() > 6;
}

bool isHotspotNodeIp(const String& nodeIp) {
  return isNodeConfigured(nodeIp) && !nodeIp.startsWith("192.168.1.");
}

String backendUrl(const String& path) {
  return String(BACKEND_BASE_URL) + path;
}

bool postJson(const String& url, const String& body, String& responseBody, int timeoutMs = 3000) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[HTTP] Wi-Fi is not connected.");
    return false;
  }

  WiFiClient client;
  HTTPClient http;
  http.setTimeout(timeoutMs);
  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Id", DEVICE_ID);
  http.addHeader("X-Device-Token", deviceToken);

  int statusCode = http.POST(body);
  responseBody = http.getString();
  http.end();

  Serial.printf("[HTTP] POST %s -> %d\n", url.c_str(), statusCode);
  if (responseBody.length() > 0) {
    Serial.println(responseBody);
  }

  return statusCode >= 200 && statusCode < 300;
}

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.printf("Connecting to Wi-Fi SSID: %s", WIFI_SSID);
  while (WiFi.status() != WL_CONNECTED) {
    delay(WIFI_RETRY_DELAY_MS);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("Wi-Fi connected.");
  Serial.print("ESP32 IP address: ");
  Serial.println(WiFi.localIP());
  Serial.print("ESP32 MAC address: ");
  Serial.println(WiFi.macAddress());
}

void applyBackendConfig(const String& responseBody) {
  if (responseBody.length() == 0) return;

  DynamicJsonDocument doc(4096);
  DeserializationError error = deserializeJson(doc, responseBody);

  if (error) {
    Serial.print("Backend config JSON parse failed: ");
    Serial.println(error.c_str());
    return;
  }

  deviceToken = String((const char*)(doc["device_token"] | deviceToken.c_str()));
  sensorIntervalMs = doc["sample_interval_ms"] | sensorIntervalMs;
  hysteresis = doc["hysteresis"] | hysteresis;

  if (doc["nodes"].is<JsonObject>()) {
    const char* lightIp = doc["nodes"]["light_node_ip"] | "";
    const char* boilerIp = doc["nodes"]["boiler_node_ip"] | "";

    // Only override local placeholders if backend has real IP values.
    String backendLightIp = String(lightIp);
    String backendBoilerIp = String(boilerIp);

    if (isHotspotNodeIp(backendLightIp)) {
      LED_NODE_IP = backendLightIp;
    }
    if (isHotspotNodeIp(backendBoilerIp)) {
      BOILER_NODE_IP = backendBoilerIp;
    }
  }

  if (doc["rooms"].is<JsonArray>()) {
    for (JsonObject room : doc["rooms"].as<JsonArray>()) {
      String code = String((const char*)(room["code"] | ""));
      float target = room["target_temp"] | 21.0;

      if (code == "ROOM1") targetRoom1 = target;
      if (code == "ROOM2") targetRoom2 = target;
    }
  }

  Serial.println("Backend config applied.");
  Serial.printf("Interval=%lu ms, hysteresis=%.2f\n", sensorIntervalMs, hysteresis);
  Serial.printf("LED node IP=%s, Relay node IP=%s\n", LED_NODE_IP.c_str(), BOILER_NODE_IP.c_str());
}

void registerWithBackend() {
  if (!isBackendConfigured()) {
    Serial.println("BACKEND_BASE_URL still contains CHANGE_ME. Skipping backend register.");
    return;
  }

  DynamicJsonDocument doc(512);
  doc["device_id"] = DEVICE_ID;
  doc["device_type"] = DEVICE_TYPE;
  doc["firmware_version"] = FIRMWARE_VERSION;
  doc["ip_address"] = WiFi.localIP().toString();
  JsonArray capabilities = doc.createNestedArray("capabilities");
  capabilities.add("lights");
  capabilities.add("heating");
  capabilities.add("temperature_gateway");
  capabilities.add("button_gateway");

  String body;
  serializeJson(doc, body);

  String response;
  if (postJson(backendUrl("/embedded/register"), body, response, 5000)) {
    Serial.println("Backend register OK.");
    applyBackendConfig(response);
  } else {
    Serial.println("Backend register FAILED. Check laptop hotspot IP and backend status.");
  }
}

void sendHeartbeat() {
  if (!isBackendConfigured()) return;

  DynamicJsonDocument doc(256);
  doc["device_id"] = DEVICE_ID;
  doc["firmware_version"] = FIRMWARE_VERSION;
  doc["ip_address"] = WiFi.localIP().toString();
  doc["wifi_rssi"] = WiFi.RSSI();

  String body;
  serializeJson(doc, body);

  String response;
  postJson(backendUrl("/embedded/heartbeat"), body, response);
}

void reportTemperature(const String& roomCode, float temperature, float humidity) {
  if (!isBackendConfigured()) return;

  DynamicJsonDocument doc(384);
  doc["device_id"] = DEVICE_ID;
  doc["room_code"] = roomCode;
  doc["value"] = temperature;
  doc["humidity"] = humidity;

  String body;
  serializeJson(doc, body);

  String response;
  postJson(backendUrl("/embedded/readings/temperature"), body, response);
}

void reportLightEvent(bool newState) {
  if (!isBackendConfigured()) return;

  DynamicJsonDocument doc(256);
  doc["device_id"] = DEVICE_ID;
  doc["new_state"] = newState;

  String body;
  serializeJson(doc, body);

  String response;
  postJson(backendUrl("/embedded/events/light"), body, response);
}

void reportBoilerEvent(bool newState) {
  if (!isBackendConfigured()) return;

  DynamicJsonDocument doc(256);
  doc["device_id"] = DEVICE_ID;
  doc["new_state"] = newState;

  String body;
  serializeJson(doc, body);

  String response;
  postJson(backendUrl("/embedded/events/boiler"), body, response);
}

bool sendCommandToNode(const String& nodeIp, const String& state) {
  if (!isNodeConfigured(nodeIp)) {
    Serial.printf("Node IP is not configured: %s\n", nodeIp.c_str());
    return false;
  }

  WiFiClient client;
  HTTPClient http;
  String url = "http://" + nodeIp + "/control";

  StaticJsonDocument<128> doc;
  doc["cmd"] = "set_gpio";
  doc["val"] = state;

  String body;
  serializeJson(doc, body);

  http.setTimeout(2500);
  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");
  int statusCode = http.POST(body);
  String response = http.getString();
  http.end();

  Serial.printf("[NODE] POST %s -> %d\n", url.c_str(), statusCode);
  if (response.length() > 0) Serial.println(response);

  return statusCode >= 200 && statusCode < 300;
}

void updateBoilerState() {
  bool room1NeedsHeat = tempRoom1 > 0 && tempRoom1 < (targetRoom1 - hysteresis);
  bool room2NeedsHeat = tempRoom2 > 0 && tempRoom2 < (targetRoom2 - hysteresis);
  bool shouldBoilerBeOn = room1NeedsHeat || room2NeedsHeat;

  if (shouldBoilerBeOn == boilerOn) return;

  boilerOn = shouldBoilerBeOn;
  if (sendCommandToNode(BOILER_NODE_IP, boilerOn ? "HIGH" : "LOW")) {
    reportBoilerEvent(boilerOn);
  }
}

void handleApiInternal() {
  if (!server.hasArg("plain")) {
    server.send(400, "application/json", "{\"message\":\"No body\"}");
    return;
  }

  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, server.arg("plain"));

  if (error) {
    server.send(400, "application/json", "{\"message\":\"Invalid JSON\"}");
    return;
  }

  String type = String((const char*)(doc["type"] | ""));
  String deviceId = String((const char*)(doc["device_id"] | ""));

  if (type == "button") {
    String action = String((const char*)(doc["action"] | ""));
    if (action == "toggle") {
      lightState = (lightState == "LOW") ? "HIGH" : "LOW";
      if (sendCommandToNode(LED_NODE_IP, lightState)) {
        reportLightEvent(lightState == "HIGH");
      }
    }
  } else if (type == "sensor") {
    float temp = doc["temp"] | 0.0;
    float hum = doc["hum"] | 0.0;

    if (deviceId == "ESP01_DHT11_ROOM1") {
      tempRoom1 = temp;
      reportTemperature("ROOM1", tempRoom1, hum);
    } else {
      tempRoom2 = temp;
      reportTemperature("ROOM2", tempRoom2, hum);
    }

    updateBoilerState();
  }

  StaticJsonDocument<128> response;
  response["status"] = "ok";
  response["interval"] = sensorIntervalMs;

  String responseBody;
  serializeJson(response, responseBody);
  server.send(200, "application/json", responseBody);
}

void handleApiTemp() {
  if (!server.hasArg("plain")) {
    server.send(400, "application/json", "{\"message\":\"No body\"}");
    return;
  }

  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, server.arg("plain"));

  if (error) {
    server.send(400, "application/json", "{\"message\":\"Invalid JSON\"}");
    return;
  }

  String roomCode = String((const char*)(doc["id_camera"] | ""));
  float targetTemp = doc["temp"] | 21.0;

  if (roomCode == "ROOM1") {
    targetRoom1 = targetTemp;
  } else if (roomCode == "ROOM2") {
    targetRoom2 = targetTemp;
  } else {
    server.send(400, "application/json", "{\"message\":\"Unknown room\"}");
    return;
  }

  updateBoilerState();

  StaticJsonDocument<192> response;
  response["status"] = "temp_processed";
  response["id_camera"] = roomCode;
  response["target_temp"] = targetTemp;
  response["boiler_on"] = boilerOn;

  String responseBody;
  serializeJson(response, responseBody);
  server.send(200, "application/json", responseBody);
}

void handleApiLights() {
  if (!server.hasArg("plain")) {
    server.send(400, "application/json", "{\"message\":\"No body\"}");
    return;
  }

  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, server.arg("plain"));

  if (error) {
    server.send(400, "application/json", "{\"message\":\"Invalid JSON\"}");
    return;
  }

  bool isOn = doc["is_on"] | false;
  lightState = isOn ? "HIGH" : "LOW";
  bool delivered = sendCommandToNode(LED_NODE_IP, lightState);

  if (delivered) {
    reportLightEvent(isOn);
  }

  StaticJsonDocument<160> response;
  response["status"] = delivered ? "lights_processed" : "node_unreachable";
  response["is_on"] = isOn;

  String responseBody;
  serializeJson(response, responseBody);
  server.send(delivered ? 200 : 503, "application/json", responseBody);
}

void handleApiRand() {
  if (!server.hasArg("plain")) {
    server.send(400, "application/json", "{\"message\":\"No body\"}");
    return;
  }

  StaticJsonDocument<128> doc;
  DeserializationError error = deserializeJson(doc, server.arg("plain"));

  if (error) {
    server.send(400, "application/json", "{\"message\":\"Invalid JSON\"}");
    return;
  }

  unsigned long value = doc["timp_esantion"] | sensorIntervalMs;
  if (value > 0) sensorIntervalMs = value;

  StaticJsonDocument<128> response;
  response["status"] = "rand_ok";
  response["timp_esantion"] = sensorIntervalMs;

  String responseBody;
  serializeJson(response, responseBody);
  server.send(200, "application/json", responseBody);
}

void handleStatus() {
  DynamicJsonDocument doc(768);
  doc["device_id"] = DEVICE_ID;
  doc["firmware_version"] = FIRMWARE_VERSION;
  doc["ip_address"] = WiFi.localIP().toString();
  doc["backend_url"] = BACKEND_BASE_URL;
  doc["wifi_connected"] = WiFi.status() == WL_CONNECTED;
  doc["wifi_rssi"] = WiFi.RSSI();
  doc["temp_room1"] = tempRoom1;
  doc["temp_room2"] = tempRoom2;
  doc["target_room1"] = targetRoom1;
  doc["target_room2"] = targetRoom2;
  doc["sensor_interval_ms"] = sensorIntervalMs;
  doc["led_node_ip"] = LED_NODE_IP;
  doc["boiler_node_ip"] = BOILER_NODE_IP;
  doc["boiler_on"] = boilerOn;

  String responseBody;
  serializeJson(doc, responseBody);
  server.send(200, "application/json", responseBody);
}

void setupHttpServer() {
  server.on("/api", HTTP_POST, handleApiInternal);
  server.on("/api/temp", HTTP_POST, handleApiTemp);
  server.on("/api/lights", HTTP_POST, handleApiLights);
  server.on("/api/rand", HTTP_POST, handleApiRand);
  server.on("/api/status", HTTP_GET, handleStatus);
  server.begin();
  Serial.println("ESP32 HTTP server started on port 80.");
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  pinMode(STATUS_LED_PIN, OUTPUT);
  digitalWrite(STATUS_LED_PIN, LOW);

  connectWiFi();
  setupHttpServer();
  registerWithBackend();
  sendHeartbeat();
}

void loop() {
  server.handleClient();

  unsigned long now = millis();
  if (now - lastHeartbeatAt >= HEARTBEAT_INTERVAL_MS) {
    lastHeartbeatAt = now;
    sendHeartbeat();
  }

  if (now - lastPendingFlushAt >= PENDING_FLUSH_INTERVAL_MS) {
    lastPendingFlushAt = now;
    // Reserved for future retry queue if hotspot/backend is temporarily down.
  }
}
