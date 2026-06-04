#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ArduinoJson.h>

// ESP01 LED node - Hotspot/DHCP version

const char* WIFI_SSID = "Serban Iphone";
const char* WIFI_PASSWORD = "Penispenis";
const char* DEVICE_ID = "ESP01_LED_ROOM1";

// GPIO3 is RX on many ESP01 boards. If upload/serial becomes unstable, move LED to GPIO2.
#define LED_PIN 3

ESP8266WebServer server(80);
String currentState = "LOW";

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.printf("Connecting to Wi-Fi SSID: %s", WIFI_SSID);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("Wi-Fi connected.");
  Serial.print("LED ESP01 IP address: ");
  Serial.println(WiFi.localIP());
  Serial.print("LED ESP01 MAC address: ");
  Serial.println(WiFi.macAddress());
}

void sendJsonStatus(int httpCode, const String& status) {
  StaticJsonDocument<256> doc;
  doc["device_id"] = DEVICE_ID;
  doc["status"] = status;
  doc["val"] = currentState;
  doc["ip_address"] = WiFi.localIP().toString();

  String response;
  serializeJson(doc, response);
  server.send(httpCode, "application/json", response);
}

void handleControl() {
  if (!server.hasArg("plain")) {
    sendJsonStatus(400, "missing_body");
    return;
  }

  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, server.arg("plain"));

  if (error) {
    sendJsonStatus(400, "invalid_json");
    return;
  }

  String cmd = String((const char*)(doc["cmd"] | ""));
  String val = String((const char*)(doc["val"] | ""));

  if (cmd != "set_gpio" || (val != "HIGH" && val != "LOW")) {
    sendJsonStatus(400, "invalid_command");
    return;
  }

  currentState = val;
  digitalWrite(LED_PIN, currentState == "HIGH" ? HIGH : LOW);
  Serial.println("LED state changed to: " + currentState);
  sendJsonStatus(200, "ok");
}

void handleStatus() {
  sendJsonStatus(200, "ok");
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  connectWiFi();

  server.on("/control", HTTP_POST, handleControl);
  server.on("/status", HTTP_GET, handleStatus);
  server.begin();
  Serial.println("LED ESP01 HTTP server started on port 80.");
}

void loop() {
  server.handleClient();
}
