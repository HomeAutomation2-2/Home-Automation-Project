#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ArduinoJson.h>

const char *ssid = "Orange-H7XZR3-2G";
const char *password = "QTfDNCdtskZh4Z5PKZ";

// IP Static pentru acest ESP01 (Calorifer)
IPAddress local_IP(192, 168, 1, 91);
IPAddress gateway(192, 168, 1, 1);
IPAddress subnet(255, 255, 255, 0);

#define RELAY_PIN 2 // GPIO2 pe ESP01

ESP8266WebServer server(80);

void handleControl() {
  if (!server.hasArg("plain")) {
    server.send(400, "text/plain", "No Data");
    return;
  }

  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, server.arg("plain"));
  
  if (error) {
    server.send(400, "application/json", "{\"status\":\"error\"}");
    return;
  }

  String cmd = doc["cmd"];
  String val = doc["val"];

  if (cmd == "set_gpio") {
    if (val == "HIGH") {
      digitalWrite(RELAY_PIN, HIGH);
      Serial.println("Centrala PORNITA");
    } else if (val == "LOW") {
      digitalWrite(RELAY_PIN, LOW);
      Serial.println("Centrala OPRITA");
    }
  }

  server.send(200, "application/json", "{\"status\":\"ok\"}");
}

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW); // Oprit initial

  if (!WiFi.config(local_IP, gateway, subnet)) {
    Serial.println("Static IP Failed");
  }

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi Connected! IP: ");
  Serial.println(WiFi.localIP());

  server.on("/control", HTTP_POST, handleControl);
  server.begin();
}

void loop() {
  server.handleClient();
}