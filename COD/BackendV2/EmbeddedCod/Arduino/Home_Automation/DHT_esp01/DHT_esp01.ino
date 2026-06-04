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
// #include <ESP8266WiFi.h>
// #include <ESP8266HTTPClient.h>
// #include <WiFiClient.h>
// #include <DHT.h>
// #include <ArduinoJson.h>

// const char *ssid = "Orange-H7XZR3-2G";
// const char *password = "QTfDNCdtskZh4Z5PKZ";
// const char* serverUrl = "http://192.168.1.93/api";

// #define DHTPIN 2
// #define DHTTYPE DHT11
// DHT dht(DHTPIN, DHTTYPE);

// void setup() {
//   Serial.begin(115200);
//   dht.begin();
//   WiFi.begin(ssid, password);
//   while (WiFi.status() != WL_CONNECTED) delay(500);
// }

// void loop() {
//   if (WiFi.status() == WL_CONNECTED) {
//     WiFiClient client;
//     HTTPClient http;

//     float h = dht.readHumidity();
//     float t = dht.readTemperature();

//     if (!isnan(h) && !isnan(t)) {
//       // Create JSON document
//       StaticJsonDocument<200> doc;
//       doc["type"] = "sensor";
//       doc["device_id"] = "ESP01_DHT11_ROOM1";
//       doc["temp"] = t;
//       doc["hum"] = h;

//       String jsonString;
//       serializeJson(doc, jsonString);

//       http.begin(client, serverUrl);
//       http.addHeader("Content-Type", "application/json");

//       int httpResponseCode = http.POST(jsonString);
      
//       // Serial.print("Sent JSON: "); Serial.println(jsonString);
//       // Serial.print("Response: "); Serial.println(httpResponseCode);
      
//       http.end();
//     }
//   }
//   delay(10000);
// }

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// const char *ssid = "Orange-H7XZR3-2G";
// const char *password = "QTfDNCdtskZh4Z5PKZ";
// const char* serverUrl = "http://192.168.1.93/api";
const char* serverUrl = "http://172.20.10.2/api";

const char *ssid = "Serban Iphone";
const char *password = "Penispenis";

#define DHTPIN 2
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

unsigned long lastReadTime = 0;
unsigned long readingInterval=5000; // Intervalul default (10 secunde)

void setup() {
  Serial.begin(115200);
  dht.begin();
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(500);
  Serial.println("\nWiFi Connected");
}

void loop() {
  // Verificam daca a trecut timpul setat in readingInterval
    if (WiFi.status() == WL_CONNECTED) {
      WiFiClient client;
      HTTPClient http;

      float h = dht.readHumidity();
      float t = dht.readTemperature();

      if (!isnan(h) && !isnan(t)) {
        // Creare JSON pentru trimitere
        StaticJsonDocument<200> doc;
        doc["type"] = "sensor";
        doc["device_id"] = "ESP01_DHT11_ROOM1";
        doc["temp"] = t;
        doc["hum"] = h;

        String jsonString;
        serializeJson(doc, jsonString);

        http.begin(client, serverUrl);
        http.addHeader("Content-Type", "application/json");

        int httpResponseCode = http.POST(jsonString);
        
        // Daca am primit un raspuns valid de la ESP32
        if (httpResponseCode == 200) {
          String responseBody = http.getString(); // Citim raspunsul de la ESP32
          
          // Parsam JSON-ul primit inapoi
          StaticJsonDocument<200> responseDoc;
          DeserializationError error = deserializeJson(responseDoc, responseBody);
          
          if (!error && responseDoc.containsKey("interval")) {
            // Actualizam intervalul cu valoarea primita de la ESP32
            unsigned long newInterval = responseDoc["interval"];
            if (newInterval > 0) {
              readingInterval = newInterval;
              Serial.printf("Noul interval de citire setat la: %lu ms\n", readingInterval);
            }
          }
        } else {
          Serial.printf("Eroare la trimitere: %d\n", httpResponseCode);
        }
        
        http.end();
      } else {
        Serial.println("Eroare la citirea senzorului DHT!");
      }
    }
    delay(readingInterval);
}