// #include <ESP8266WiFi.h>
// #include <ESP8266HTTPClient.h>
// #include <WiFiClient.h>

// const char *ssid = "Orange-H7XZR3-2G";
// const char *password = "QTfDNCdtskZh4Z5PKZ";
// const char* serverIP = "http://192.168.1.93/toggle"; // Update this!

// const int buttonPin = 3;
// bool lastButtonState = HIGH;

// void setup() {
//   Serial.begin(115200);
//   pinMode(buttonPin, INPUT_PULLUP); // Use internal pull-up

//   WiFi.begin(ssid, password);
//   while (WiFi.status() != WL_CONNECTED) {
//     delay(500);
//     Serial.print(".");
//   }
//   Serial.println("\nConnected to WiFi");
// }

// void loop() {
//   bool currentButtonState = digitalRead(buttonPin);

//   // Detect falling edge (press)
//   if (currentButtonState == LOW && lastButtonState == HIGH) {
//     Serial.println("Button Pressed! Sending request...");
    
//     if (WiFi.status() == WL_CONNECTED) {
//       WiFiClient client;
//       HTTPClient http;
      
//       http.begin(client, serverIP);
//       int httpCode = http.GET();
      
//       if (httpCode > 0) {
//         Serial.printf("Server response: %d\n", httpCode);
//       } else {
//         Serial.printf("Error: %s\n", http.errorToString(httpCode).c_str());
//       }
//       http.end();
//     }
//     delay(200); // Simple debounce
//   }
//   lastButtonState = currentButtonState;
// }

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

const char *ssid = "Orange-H7XZR3-2G";
const char *password = "QTfDNCdtskZh4Z5PKZ";
const char* serverUrl = "http://192.168.1.93/api";

#define BUTTON_PIN 3
bool lastButtonState = HIGH;

void setup() {
  Serial.begin(115200);
  pinMode(BUTTON_PIN, INPUT_PULLUP); // Use internal pullup

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(500);
}

void sendToggleRequest() {
  WiFiClient client;
  HTTPClient http;
  
  StaticJsonDocument<200> doc;
  doc["type"] = "button";
  doc["action"] = "toggle";
  doc["device"] = "ESP01_BUTTON_UNIT";

  String jsonString;
  serializeJson(doc, jsonString);

  http.begin(client, serverUrl);
  http.addHeader("Content-Type", "application/json");
  
  int httpCode = http.POST(jsonString);
  Serial.printf("Sent Toggle. Response: %d\n", httpCode);
  http.end();
}

void loop() {
  bool currentButtonState = digitalRead(BUTTON_PIN);

  // Detect transition from HIGH to LOW (Press)
  if (currentButtonState == LOW && lastButtonState == HIGH) {
    delay(50); // Simple debounce
    if (digitalRead(BUTTON_PIN) == LOW) {
      sendToggleRequest();
    }
  }
  lastButtonState = currentButtonState;
}