#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266mDNS.h>
#include <DHT.h>
#include <ArduinoJson.h>


#define DHTPIN 2
#define DHTTYPE DHT11
#define SENSOR_ID "ESP01_DHT11_ROOM2"


const char *ssid = "E22";
const char *password = "e2200112";


DHT dht(DHTPIN, DHTTYPE);

unsigned long lastReadTime = 0;
unsigned long readingInterval = 20000;



/*
    Log a message the the ESP32.
*/
void logToESP32(String message) 
{
    WiFiClient client;
    HTTPClient http;
    http.begin(client, "http://smartlock.local/node/log");
    http.addHeader("Content-Type", "application/json");

    JsonDocument doc;
    doc["device"] = "TEMP_SENSOR";
    doc["msg"] = message;

    String body;
    serializeJson(doc, body);

    http.POST(body);
    http.end();
}



void setup() 
{
    dht.begin();
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED) 
        delay(500);
    
    MDNS.begin("esp01_temp_sensor");

    logToESP32("Sensor unit booted and connected via DNS Discovery mode.");
}



void loop() 
{
    MDNS.update();
    unsigned long now = millis();

    if (now - lastReadTime >= readingInterval) 
    {
        lastReadTime = now;

        if (WiFi.status() == WL_CONNECTED) 
        {
            WiFiClient client;
            HTTPClient http;

            float t = dht.readTemperature();
            if (!isnan(t)) 
            {
                JsonDocument doc;
                doc["type"] = "sensor";
                doc["device_id"] = SENSOR_ID; 
                doc["temp"] = t;

                String jsonString;
                serializeJson(doc, jsonString);

                String serverUrl = "http://smartlock.local/node/inbound";
                http.begin(client, serverUrl);
                http.addHeader("Content-Type", "application/json");

                int httpResponseCode = http.POST(jsonString);
                if (httpResponseCode == 200) 
                {
                    JsonDocument responseDoc;
                    if (!deserializeJson(responseDoc, http.getString())) 
                    {
                        unsigned long newInterval = responseDoc["interval"];
                        if (newInterval > 0) 
                        {
                            readingInterval = newInterval;
                        }
                    }
                }

                http.end();
            }
        }
    }
}