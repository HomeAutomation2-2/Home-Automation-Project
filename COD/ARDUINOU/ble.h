// 
// HANDLES BLE COMMUNICATIONS
// 

#pragma once

#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <ArduinoJson.h>
#include "config.h"


#define SERVICE_UUID     "0000180a-0000-1000-8000-00805f9b34fb"
#define WRITE_CHAR_UUID  "00002a29-0000-1000-8000-00805f9b34fb"
#define NOTIFY_CHAR_UUID "00002a28-0000-1000-8000-00805f9b34fb"


struct Room;
extern Room rooms[2];
extern String allowedHashes[];
extern int totalUsers;
extern bool isDoorOpened;

static BLECharacteristic* pNotifyChar = nullptr;



class ServerCallbacks : public BLEServerCallbacks 
{
    void onConnect(BLEServer* pServer) override 
    {
        Serial.println("[BLE] Client connected.");
    }


    void onDisconnect(BLEServer* pServer) override 
    {
        Serial.println("[BLE] Client disconnected. Restarting advertising...");
    
        pServer->startAdvertising();
    }
};



class WriteCallbacks : public BLECharacteristicCallbacks 
{
    void onWrite(BLECharacteristic* pChar) override 
    {
        String value = pChar->getValue();
    
        if (value.length() == 0) 
            return;

        Serial.print("[BLE] Received: ");
        Serial.println(value);

        JsonDocument doc;
        if (deserializeJson(doc, value)) 
        {
            Serial.println("[BLE] Failed to parse JSON.");

            sendBleResponse("fail", isDoorOpened ? "unlocked" : "locked");
            return;
        }

        const char* code   = doc["code"]   | "";
        const char* action = doc["action"] | "";

        bool authorized = false;

        for (int i = 0; i < totalUsers; i++) 
        {
            if (allowedHashes[i] == code) 
            {
                authorized = true;
                break;
            }
        }

        if (!authorized) 
        {
            Serial.println("[BLE] Unauthorized code.");

            sendBleResponse("fail", isDoorOpened ? "unlocked" : "locked");
            return;
        }

        if (strcmp(action, "unlock") == 0) 
        {
            isDoorOpened = true;
        } 
        else if (strcmp(action, "lock") == 0) 
        {
            isDoorOpened = false;
        }

        sendBleResponse("success", isDoorOpened ? "unlocked" : "locked");
    }

    
    void sendBleResponse(const char* status, const char* door) 
    {
        JsonDocument res;
        res["request_status"] = status;
        res["door_status"]    = door;

        String out;
        serializeJson(res, out);

        pNotifyChar->setValue(out);
        pNotifyChar->notify();

        Serial.print("[BLE] Response: ");
        Serial.println(out);
    }
};



inline void setupBLE() 
{
    BLEDevice::init("SmartLock");
    BLEServer* pServer = BLEDevice::createServer();
    pServer->setCallbacks(new ServerCallbacks());

    BLEService* pService = pServer->createService(SERVICE_UUID);

    BLECharacteristic* pWriteChar = pService->createCharacteristic(
        WRITE_CHAR_UUID,
        BLECharacteristic::PROPERTY_WRITE
    );
    pWriteChar->setCallbacks(new WriteCallbacks());

    pNotifyChar = pService->createCharacteristic(
        NOTIFY_CHAR_UUID,
        BLECharacteristic::PROPERTY_NOTIFY
    );
    pNotifyChar->addDescriptor(new BLE2902());

    pService->start();

    BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
    pAdvertising->addServiceUUID(SERVICE_UUID);
    pAdvertising->setScanResponse(true);
    pAdvertising->setMinPreferred(0x06);
    pAdvertising->setMinPreferred(0x12);
    BLEDevice::startAdvertising();

    Serial.println("[BLE] Advertising as 'SmartLock'.");
}