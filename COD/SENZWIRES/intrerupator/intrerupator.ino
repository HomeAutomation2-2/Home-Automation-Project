#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266mDNS.h>
#include <ArduinoJson.h>


#define BUTTON_PIN 3


const char *ssid = "NothingHere";
const char *password = "8689013472";

bool lastButtonState = HIGH;


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
    doc["device"] = "LIGHT_SWITCH";
    doc["msg"] = message;

    String body;
    serializeJson(doc, body);

    http.POST(body);
    http.end();
}



/*
    Send a light toggle request to the ESP32.
*/
void sendToggleRequest() 
{
    WiFiClient client;
    HTTPClient http;
    
    String serverUrl = "http://smartlock.local/node/inbound";
    
    JsonDocument doc;
    doc["type"] = "button";
    doc["action"] = "toggle";

    String jsonString;
    serializeJson(doc, jsonString);

    http.begin(client, serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    int httpCode = http.POST(jsonString);
    if (httpCode == 200) 
    {
        logToESP32("Toggle command delivered successfully to ESP32.");
    } 
    else 
    {
        logToESP32("Failed to deliver toggle! HTTP Code: " + String(httpCode));
    }

    http.end();
}



void setup() 
{
    pinMode(BUTTON_PIN, INPUT_PULLUP);

    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) 
        delay(500);

    MDNS.begin("esp01_button")

    logToESP32("Button unit booted and connected via DNS Discovery mode.");
}



void loop() 
{
    MDNS.update();
    bool currentButtonState = digitalRead(BUTTON_PIN);

    if (currentButtonState == LOW && lastButtonState == HIGH) 
    {
        delay(1000);  // 1sec debounce on the button
        
        if (digitalRead(BUTTON_PIN) == LOW)
        {
            logToESP32("Physical button press detected.");
            sendToggleRequest();
        }
    }

    lastButtonState = currentButtonState;
}