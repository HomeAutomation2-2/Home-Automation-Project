#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// ESP01 DHT11 node - Hotspot/DHCP version
// Upload ESP32 first, read ESP32 IP from Serial Monitor, then replace ESP32_BASE_URL.

const char* WIFI_SSID = "Serban Iphone";
const char* WIFI_PASSWORD = "Penispenis";

const char* DEVICE_ID = "ESP01_DHT11_ROOM1";
const char* ESP32_BASE_URL = "http://CHANGE_ME_ESP32_IP";

#define DHTPIN 2
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

unsigned long readingIntervalMs = 5000;

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
  Serial.print("DHT ESP01 IP address: ");
  Serial.println(WiFi.localIP());
  Serial.print("DHT ESP01 MAC address: ");
  Serial.println(WiFi.macAddress());
}

void sendReading(float temperature, float humidity) {
  if (!isEsp32Configured()) {
    Serial.println("ESP32_BASE_URL still contains CHANGE_ME. Skipping send.");
    return;
  }

  WiFiClient client;
  HTTPClient http;

  StaticJsonDocument<200> doc;
  doc["type"] = "sensor";
  doc["device_id"] = DEVICE_ID;
  doc["temp"] = temperature;
  doc["hum"] = humidity;

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

  if (statusCode == 200) {
    StaticJsonDocument<200> responseDoc;
    DeserializationError error = deserializeJson(responseDoc, responseBody);

    if (!error && responseDoc.containsKey("interval")) {
      unsigned long nextInterval = responseDoc["interval"];
      if (nextInterval > 0) {
        readingIntervalMs = nextInterval;
        Serial.printf("Updated reading interval: %lu ms\n", readingIntervalMs);
      }
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  dht.begin();
  connectWiFi();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("Failed to read from DHT sensor.");
  } else {
    Serial.printf("DHT reading: temp=%.2f C, hum=%.2f %%\n", temperature, humidity);
    sendReading(temperature, humidity);
  }

  delay(readingIntervalMs);
}
