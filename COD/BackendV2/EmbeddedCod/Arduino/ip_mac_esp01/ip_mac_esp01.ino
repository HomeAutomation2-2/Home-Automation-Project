#include <ESP8266WiFi.h>

const char* ssid = "Serban Iphone";
const char* password = "Penispenis";

void setup() {
  // Use 115200 baud rate - common for ESP8266
  Serial.begin(115200);
  delay(10);

  Serial.println("\n\nConnecting to WiFi...");
  WiFi.begin(ssid, password);

  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected!");
  
  // This is the magic line that shows your IP
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // Also helpful to know for your router settings:
  Serial.print("MAC Address: ");
  Serial.println(WiFi.macAddress());
}

void loop() {
  // Nothing to do here
}