#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>

// ESP01 Button node - Hotspot/DHCP version
// Upload ESP32 first, read ESP32 IP from Serial Monitor, then replace ESP32_BASE_URL.

const char* WIFI_SSID = "Serban Iphone";
const char* WIFI_PASSWORD = "Penispenis";

const char* DEVICE_ID = "ESP01_BUTTON_UNIT";
const char* ESP32_BASE_URL = "http://CHANGE_ME_ESP32_IP";

#define BUTTON_PIN 3

bool lastButtonState = HIGH;

bool isEsp32Configured() {
  return String(ESP32_BASE_URL).indexOf("CHANGE_ME") < 0;
}

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
  Serial.print("Button ESP01 IP address: ");
  Serial.println(WiFi.localIP());
  Serial.print("Button ESP01 MAC address: ");
  Serial.println(WiFi.macAddress());
}

void sendToggleRequest() {
  if (!isEsp32Configured()) {
    Serial.println("ESP32_BASE_URL still contains CHANGE_ME. Skipping toggle.");
    return;
  }

  WiFiClient client;
  HTTPClient http;

  StaticJsonDocument<200> doc;
  doc["type"] = "button";
  doc["device_id"] = DEVICE_ID;
  doc["action"] = "toggle";

  String body;
  serializeJson(doc, body);

  String url = String(ESP32_BASE_URL) + "/api";
  http.setTimeout(3000);
  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");

  int statusCode = http.POST(body);
  String responseBody = http.getString();
  http.end();

  Serial.printf("POST %s -> %d\n", url.c_str(), statusCode);
  if (responseBody.length() > 0) Serial.println(responseBody);
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  connectWiFi();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  bool currentButtonState = digitalRead(BUTTON_PIN);

  if (currentButtonState == LOW && lastButtonState == HIGH) {
    delay(50);
    if (digitalRead(BUTTON_PIN) == LOW) {
      sendToggleRequest();
    }
  }

  lastButtonState = currentButtonState;
}
