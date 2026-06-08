#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ArduinoJson.h>

#define LED_PIN 3
ESP8266WebServer server(80);
// const char *ssid = "Orange-H7XZR3-2G";
// const char *password = "QTfDNCdtskZh4Z5PKZ";
// const char* serverUrl = "http://192.168.1.93/api";

const char *ssid = "Serban Iphone";
const char *password = "Penispenis";

IPAddress local_IP(192, 168, 1, 90);   
IPAddress gateway(192, 168, 1, 1);    
IPAddress subnet(255, 255, 255, 0);

void handleControl() {
  if (!server.hasArg("plain")) {
    server.send(400, "text/plain", "No Body");
    return;
  }

  StaticJsonDocument<200> doc;
  deserializeJson(doc, server.arg("plain"));
  String state;
  if (doc["cmd"] == "set_gpio") {
    String val = doc["val"];
    
    if (val == "HIGH"){
      digitalWrite(LED_PIN, HIGH);
    }else{ 
      digitalWrite(LED_PIN, LOW);}

    // server.send(200, "application/json", "{\"status\":\"executed\"}");
    String jsonResponse = "{\"status\":\"ok\", \"valoare_Led\":" + val + "}";
    server.send(200, "application/json", jsonResponse);
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  
  // if (!WiFi.config(local_IP, gateway, subnet)) {
  //   Serial.println("STA Failed to configure Static IP");
  // }

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected.");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP()); 

  server.on("/control", HTTP_POST, handleControl);
  server.begin();
}

void loop() {
  server.handleClient(); // Always listening for the ESP32
}