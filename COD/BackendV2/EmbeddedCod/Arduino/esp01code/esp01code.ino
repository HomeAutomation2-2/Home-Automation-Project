// #include <ESP8266WiFi.h>
// #include <ESP8266HTTPClient.h>
// #include <WiFiClient.h>
// #include <DHT.h>

// const char *ssid = "Orange-H7XZR3-2G";
// const char *password = "QTfDNCdtskZh4Z5PKZ";

// // ESP32 Server Address
// const char* serverName = "http://192.168.1.93/update";

// #define DHTPIN 2        // GPIO 2 on ESP-01S
// #define DHTTYPE DHT11
// DHT dht(DHTPIN, DHTTYPE);

// void setup() {
//   Serial.begin(115200);
//   dht.begin();

//   WiFi.begin(ssid, password);
//   while (WiFi.status() != WL_CONNECTED) {
//     delay(500);
//     Serial.print(".");
//   }
//   Serial.println("\nConnected to WiFi");
// }

// void loop() {
//   if (WiFi.status() == WL_CONNECTED) {
//     WiFiClient client;
//     HTTPClient http;

//     float h = dht.readHumidity();
//     float t = dht.readTemperature();

//     if (isnan(h) || isnan(t)) {
//       Serial.println("Failed to read from DHT sensor!");
//       delay(2000);
//       return;
//     }

//     // Construct the URL with parameters
//     String url = String(serverName) + "?temp=" + String(t) + "&hum=" + String(h);
    
//     Serial.print("Sending data: ");
//     Serial.println(url);

//     http.begin(client, url);
//     int httpResponseCode = http.GET();

//     if (httpResponseCode > 0) {
//       Serial.print("HTTP Response code: ");
//       Serial.println(httpResponseCode);
//     } else {
//       Serial.print("Error code: ");
//       Serial.println(httpResponseCode);
//     }
//     http.end();
//   }

//   delay(10000); // Wait 10 seconds before next reading
// }
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ArduinoJson.h>

#define LED_PIN 2
ESP8266WebServer server(80);

void handleControl() {
  if (!server.hasArg("plain")) {
    server.send(400, "text/plain", "No Body");
    return;
  }

  StaticJsonDocument<200> doc;
  deserializeJson(doc, server.arg("plain"));

  if (doc["cmd"] == "set_gpio") {
    String val = doc["val"];
    
    // Note: ESP01-S built-in LED is often Active-LOW
    // So HIGH might turn it OFF. Adjust if necessary.
    if (val == "HIGH") digitalWrite(LED_PIN, HIGH);
    else digitalWrite(LED_PIN, LOW);

    server.send(200, "application/json", "{\"status\":\"executed\"}");
    Serial.println("LED State changed to: " + val);
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  
  // WiFi connection logic (Set Static IP here!)
  // ...

  server.on("/control", HTTP_POST, handleControl);
  server.begin();
}

void loop() {
  server.handleClient(); // Always listening for the ESP32
}