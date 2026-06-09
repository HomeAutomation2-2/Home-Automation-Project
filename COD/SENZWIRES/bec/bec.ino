#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266mDNS.h>
#include <ArduinoJson.h>


#define LED_PIN 0


const char *ssid = "E22";
const char *password = "e2200112";


unsigned long lastPollTime = 0;
const unsigned long pollInterval = 2000; // Poll state every 2 seconds
bool currentLedState = false;



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
    doc["device"] = "BUTTON_ESP01";
    doc["msg"] = message;

    String body;
    serializeJson(doc, body);
    http.POST(body);
    http.end();
}



void setup() 
{
    Serial.begin(115200);
    pinMode(LED_PIN, OUTPUT);
    
    WiFi.begin(ssid, password);
    
    while (WiFi.status() != WL_CONNECTED) 
        delay(500);

    MDNS.begin("esp01_led");

    logToESP32("Led unit booted and connected via DNS Discovery mode.");
}



void loop() 
{
    MDNS.update();
    unsigned long now = millis();

    if (now - lastPollTime >= pollInterval) 
    {
        lastPollTime = now;

        if (WiFi.status() == WL_CONNECTED) 
        {
            WiFiClient client;
            HTTPClient http;
            
            http.begin(client, "http://smartlock.local/node/outbound");
            int httpCode = http.GET();
            
            if (httpCode == 200) 
            {
                JsonDocument doc;
                if (!deserializeJson(doc, http.getString())) 
                {

                    bool targetState = doc["light_zone1"];

                    if (targetState != currentLedState) 
                    {
                        currentLedState = targetState;
                        digitalWrite(LED_PIN, targetState ? HIGH : LOW);

                        String logMsg = "Set LED to: " + String(currentLedState ? "ON" : "OFF");
                    }
                }
            }
            http.end();
        }
    }
}