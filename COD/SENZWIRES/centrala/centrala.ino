#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266mDNS.h>
#include <ArduinoJson.h>


#define RELAY_PIN 0


const char *ssid = "E22";
const char *password = "e2200112";


unsigned long lastPollTime = 0;
const unsigned long pollInterval = 2000; 



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
    doc["device"] = "BOILER";
    doc["msg"] = message;

    String body;
    serializeJson(doc, body);

    http.POST(body);
    http.end();
}



void setup() 
{
    pinMode(RELAY_PIN, OUTPUT);
    digitalWrite(RELAY_PIN, LOW);
    
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED) 
        delay(500);

    MDNS.begin("esp01_boiler");

    logToESP32("Boiler unit booted and connected via DNS Discovery mode.");
}




void loop() 
{
    MDNS.update();
    unsigned long now = millis();

    if (now - lastPollTime >= pollInterval) 
    {
        lastPollTime = now;

        if (WiFi.status() != WL_CONNECTED) 
        {
            return;
        }

        WiFiClient client;
        HTTPClient http;
        
        http.begin(client, "http://smartlock.local/node/outbound");
        int httpCode = http.GET();
        
        if (httpCode == 200) 
        {
            JsonDocument doc;
            DeserializationError error = deserializeJson(doc, http.getString());
            
            if (!error) 
            {
                bool boilerOn = doc["boiler"];
                bool currentPinState = digitalRead(RELAY_PIN);
                
                digitalWrite(RELAY_PIN, boilerOn ? HIGH : LOW);
                
                if (boilerOn != currentPinState) 
                {
                    String stateStr = boilerOn ? "STARTED (ON)" : "STOPPED (OFF)";
                    logToESP32("State structural change! Boiler pin is now " + stateStr);
                }
            } 
            else 
            {
                logToESP32("Error: Failed to parse JSON configuration from ESP32.");
            }
        } 
        else 
        {
            logToESP32("HTTP Poll Failed! Error code: " + String(httpCode));
        }

        http.end();
    }
}