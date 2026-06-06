#pragma once

#include <Arduino.h>

void connectWiFiAndRegister();
void sendSensorData();
void httpPost(const char* path, String& body, String* responseOut = nullptr);
