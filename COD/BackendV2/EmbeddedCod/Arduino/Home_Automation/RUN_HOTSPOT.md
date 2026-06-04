# RUN Hotspot ESP BackendV2

Acest setup este pentru test local: laptopul ruleaza BackendV2, iar ESP32 + ESP01 se conecteaza la hotspotul `Serban Iphone` prin DHCP.

## 1. Porneste hotspotul si backendul

1. Porneste hotspotul `Serban Iphone`.
2. Conecteaza laptopul la acest hotspot.
3. Afla IP-ul laptopului:

```powershell
ipconfig
```

Cauta adaptorul Wi-Fi si noteaza `IPv4 Address`. Pe iPhone hotspot va fi de obicei ceva de forma `172.20.10.x`.

4. Porneste BackendV2:

```powershell
cd C:\Users\crisa\Home-Automation-Project\COD\BackendV2
npm run start:dev
```

5. Verifica din browser sau PowerShell:

```powershell
Invoke-RestMethod http://<IP_LAPTOP_HOTSPOT>:3500/health
```

## 2. Configureaza si incarca ESP32

In `esp32code/esp32code.ino`, schimba:

```cpp
const char* BACKEND_BASE_URL = "http://CHANGE_ME_LAPTOP_HOTSPOT_IP:3500";
```

cu IP-ul laptopului:

```cpp
const char* BACKEND_BASE_URL = "http://172.20.10.5:3500";
```

Incarca sketch-ul pe ESP32 si deschide Serial Monitor la `115200`. Noteaza:

```text
ESP32 IP address: 172.20.10.x
```

Daca `POST /embedded/register` esueaza:

- verifica daca backendul ruleaza pe `0.0.0.0:3500` sau pe IP accesibil din retea;
- verifica Windows Firewall pentru Node.js;
- verifica daca laptopul si ESP32 sunt pe acelasi hotspot.

## 3. Configureaza si incarca DHT ESP01

In `DHT_esp01/DHT_esp01.ino`, schimba:

```cpp
const char* ESP32_BASE_URL = "http://CHANGE_ME_ESP32_IP";
```

cu IP-ul citit din Serial Monitor pentru ESP32:

```cpp
const char* ESP32_BASE_URL = "http://172.20.10.8";
```

Incarca sketch-ul si noteaza IP-ul DHT ESP01 din Serial Monitor.

DHT trimite catre ESP32:

```http
POST http://<ESP32_IP>/api
```

cu payload mic:

```json
{
  "type": "sensor",
  "device_id": "ESP01_DHT11_ROOM1",
  "temp": 22.5,
  "hum": 45
}
```

## 4. Configureaza si incarca LED ESP01

Incarca `LED_esp01/LED_esp01.ino`. Noteaza IP-ul din Serial Monitor:

```text
LED ESP01 IP address: 172.20.10.x
```

Testeaza statusul:

```powershell
Invoke-RestMethod http://<LED_ESP01_IP>/status
```

## 5. Configureaza si incarca Relay ESP01

Incarca `RelayLED_esp01/RelayLED_esp01.ino`. Noteaza IP-ul din Serial Monitor:

```text
Relay ESP01 IP address: 172.20.10.x
```

Testeaza statusul:

```powershell
Invoke-RestMethod http://<RELAY_ESP01_IP>/status
```

## 6. Pune IP-urile nodurilor in ESP32

Revino in `esp32code/esp32code.ino` si seteaza:

```cpp
String LED_NODE_IP = "CHANGE_ME_LED_ESP01_IP";
String BOILER_NODE_IP = "CHANGE_ME_RELAY_ESP01_IP";
```

exemplu:

```cpp
String LED_NODE_IP = "172.20.10.9";
String BOILER_NODE_IP = "172.20.10.10";
```

Reincarca ESP32.

## 7. Configureaza si incarca Button ESP01

In `BUTTON_esp01/BUTTON_esp01.ino`, schimba:

```cpp
const char* ESP32_BASE_URL = "http://CHANGE_ME_ESP32_IP";
```

cu IP-ul ESP32. Incarca sketch-ul si testeaza apasarea butonului.

Butonul trimite:

```json
{
  "type": "button",
  "device_id": "ESP01_BUTTON_UNIT",
  "action": "toggle"
}
```

## 8. Teste rapide

Status ESP32:

```powershell
Invoke-RestMethod http://<ESP32_IP>/api/status
```

Schimba lumina prin ESP32:

```powershell
Invoke-RestMethod http://<ESP32_IP>/api/lights -Method POST -ContentType "application/json" -Body '{"is_on":true}'
```

Schimba temperatura tinta pentru camera 1:

```powershell
Invoke-RestMethod http://<ESP32_IP>/api/temp -Method POST -ContentType "application/json" -Body '{"id_camera":"ROOM1","temp":23}'
```

Schimba intervalul DHT:

```powershell
Invoke-RestMethod http://<ESP32_IP>/api/rand -Method POST -ContentType "application/json" -Body '{"timp_esantion":10000}'
```

## Observatii

- `localhost` nu functioneaza din ESP32/ESP01. Foloseste IP-ul laptopului in hotspot.
- `StaticJsonDocument<200>` nu inseamna limita hardware de 200 caractere. Este doar memoria alocata pentru JSON-ul local.
- ESP32 foloseste `DynamicJsonDocument<4096>` pentru raspunsuri mai mari venite de la backend.
- Daca iPhone-ul schimba IP-urile DHCP, trebuie actualizate constantele si reincarcate sketch-urile afectate.
- Pentru testul local, backendul poate apela ESP32 direct doar daca laptopul si ESP32 sunt pe acelasi hotspot.
