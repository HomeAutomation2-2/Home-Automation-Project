#pragma once
#include <Arduino.h>

struct Room {
    int   id;
    float currentTemp;
    float targetTemp;
    bool  isHeating;
    int   zoneId;
    bool  lightState;
    float offset;
};

// ─── Shared state (defined in SmartLock.ino) ──────────────────────────────────
extern Room   rooms[2];
extern String allowedHashes[];
extern int    totalUsers;
extern float  hysteresis;
extern int    samplingPeriod;
extern bool   isDoorOpened;
extern bool   boilerState;
