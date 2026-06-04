# BackendV2 - pasi de lucru si contract ESP32

## Scop

`BackendV2` trebuie sa inlocuiasca backendul vechi fara sa rupa aplicatia mobila sau modulele embedded. Serverul ramane sursa de adevar pentru utilizatori, sesiuni, camere, lumini, programe termice si loguri. ESP32 ramane executorul local pentru lumini, centrala si, intr-o etapa ulterioara, usa prin Bluetooth.

Etapa curenta: legam perfect BackendV2 de codul Arduino existent prin Wi-Fi/HTTP. Bluetooth si zavorul raman pentru etapa urmatoare, dupa ce fluxul backend -> ESP32 -> ESP01 si ESP01 -> ESP32 -> backend este stabil.

## Decizii arhitecturale

1. Backendul se construieste in NestJS, pe aceeasi idee modulara ca `COD/WEBSERVRS/backend`.
2. API-ul public ramane compatibil cu aplicatia mobila existenta.
3. Comunicarea cu ESP32 se izoleaza intr-un modul separat, `EspGatewayModule`.
4. Baza de date ruleaza in Docker/PostgreSQL si poate fi resetata la pornire in mod de dezvoltare.
5. Camerele hardware initiale se creeaza prin seed: `ROOM1` si `ROOM2`.
6. ESP32 primeste la pornire configuratia completa: camere, lumini, interval senzori, targeturi de temperatura si IP-urile nodurilor ESP01.
7. Daca ESP32 este offline, backendul salveaza schimbarea ca pending sync si o retrimite cand ESP32 revine.

## Analiza cod Arduino existent

Codul real din `COD/BackendV2/EmbeddedCod/Arduino/Home_Automation` arata ca sistemul embedded este deja gandit pe trei niveluri:

| Modul | Fisier | Rol actual | Contract actual |
|---|---|---|---|
| ESP32 gateway | `Home_Automation/esp32code/esp32code.ino` | hub local, primeste senzori/buton, comanda LED/releu | asculta `POST /api`, `POST /api/temp`, `POST /api/lights`, `POST /api/rand` |
| ESP01 DHT11 | `Home_Automation/DHT_esp01/DHT_esp01.ino` | citeste temperatura si umiditatea | trimite JSON la ESP32 `POST /api` |
| ESP01 LED | `Home_Automation/LED_esp01/LED_esp01.ino` | simuleaza lumina | asculta `POST /control` cu `{ "cmd": "set_gpio", "val": "HIGH|LOW" }` |
| ESP01 releu centrala | `Home_Automation/RelayLED_esp01/RelayLED_esp01.ino` | simuleaza centrala/electrovalva | asculta `POST /control` cu acelasi contract |
| ESP01 buton | `Home_Automation/BUTTON_esp01/BUTTON_esp01.ino` | trimite toggle lumina catre ESP32 | trimite JSON la ESP32 `POST /api` |

Concluzie arhitecturala: BackendV2 nu trebuie sa vorbeasca direct cu ESP01 DHT/LED/releu in prima faza. BackendV2 vorbeste cu ESP32, iar ESP32 ramane gateway local pentru nodurile mici ESP01.

## Ce trebuie schimbat in embedded pentru etapa 1

Nu schimbam acum Bluetooth/zavor. Pentru integrarea perfecta cu BackendV2 sunt necesare schimbari mici, controlate:

| Zona | Schimbare necesara | Motiv |
|---|---|---|
| Config Wi-Fi/IP | scoase parolele hardcodate si puse constante clare pe fiecare sketch | evitam schimbari manuale riscante si se vede imediat ce trebuie configurat |
| ESP32 gateway | adaugat `BACKEND_BASE_URL` si `DEVICE_ID` | ESP32 trebuie sa poata anunta backendul si trimite evenimente |
| ESP32 gateway | adaugat `POST /embedded/register` la pornire | backendul afla IP-ul ESP32 si ii trimite configuratia |
| ESP32 gateway | adaugat heartbeat periodic catre backend | backendul stie daca hardware-ul este online/offline |
| ESP32 gateway | dupa primirea senzorilor pe `/api`, trimite temperatura la backend | backendul poate popula `temperature_readings` si dashboardul |
| ESP32 gateway | dupa comenzi lumini/centrala, trimite eveniment la backend | logurile devin corecte |
| ESP32 gateway | validare JSON si raspunsuri JSON consistente | backendul poate trata predictibil erorile |
| ESP32 gateway | mapare explicita `ROOM1`, `ROOM2` -> noduri hardware | camerele din DB trebuie sa corespunda hardware-ului |
| DHT ESP01 | foloseste intervalul primit de la ESP32 | deja exista partial; trebuie pastrat |
| LED/Releu ESP01 | raspuns JSON valid, fara concatenari invalide | backend/ESP32 pot interpreta statusul |
| Buton ESP01 | campul `device_id` trebuie unificat | in cod apare `device`, dar ESP32 citeste `device_id` |

Observatie importanta: in codul actual exista IP-uri mixte `192.168.1.x` si `172.20.10.x`. Pentru demo trebuie aleasa o singura retea si setate coerent:

| Componenta | IP recomandat prototip |
|---|---|
| Backend PC | IP-ul PC-ului in reteaua Wi-Fi |
| ESP32 gateway | IP static sau rezervare DHCP, ex. `192.168.1.93` |
| ESP01 LED | ex. `192.168.1.90` |
| ESP01 releu centrala | ex. `192.168.1.91` |
| ESP01 DHT | poate fi DHCP, pentru ca el doar trimite catre ESP32 |

## Flow general la pornire

1. Docker porneste PostgreSQL.
2. Backendul porneste si citeste `.env`.
3. Daca `DB_RESET_ON_START=true`, backendul sterge schema publica si o recreeaza.
4. Backendul ruleaza schema/migrarile.
5. Backendul ruleaza seed:
   - user admin test
   - camere `ROOM1`, `ROOM2`
   - zone lumina pentru camere
   - program termic default
   - setari globale casa
   - device ESP32 asteptat
6. ESP32 porneste, se conecteaza la Wi-Fi si porneste serverul local.
7. ESP32 trimite handshake catre backend.
8. Backendul raspunde cu configuratia de etapa 1: camere, lumini, targeturi, interval senzori, IP nod LED si IP nod centrala.
9. ESP32 salveaza local configuratia primita.
10. Sistemul devine operational.

## Flow Backend - ESP32 la prima intalnire

### Request ESP32 -> Backend

Endpoint propus pe backend:

`POST /embedded/register`

Payload:

```json
{
  "device_id": "ESP32_MAIN_GATEWAY",
  "device_type": "gateway",
  "firmware_version": "backend-v2-esp32-0.1",
  "ip_address": "192.168.1.93",
  "capabilities": ["lights", "heating", "temperature_gateway", "button_gateway"]
}
```

### Response Backend -> ESP32

```json
{
  "device_token": "dev-device-token",
  "sample_interval_ms": 20000,
  "hysteresis": 0.5,
  "nodes": {
    "light_node_ip": "192.168.1.90",
    "boiler_node_ip": "192.168.1.91"
  },
  "rooms": [
    { "id": 1, "code": "ROOM1", "target_temp": 21.0 },
    { "id": 2, "code": "ROOM2", "target_temp": 21.0 }
  ],
  "light_zones": [
    { "id": 1, "room_code": "ROOM1", "is_on": false },
    { "id": 2, "room_code": "ROOM2", "is_on": false }
  ]
}
```

Observatie: `access_codes` nu intra in etapa 1. Le adaugam in etapa 2, cand conectam Bluetooth si zavorul.

## Flow etapa 1 - temperaturi

1. ESP01 DHT citeste temperatura si umiditatea.
2. ESP01 DHT trimite catre ESP32 `POST /api`:

```json
{
  "type": "sensor",
  "device_id": "ESP01_DHT11_ROOM1",
  "temp": 22.4,
  "hum": 45.0
}
```

3. ESP32 actualizeaza temperatura locala pentru `ROOM1` sau `ROOM2`.
4. ESP32 raspunde cu intervalul de citire:

```json
{
  "status": "ok",
  "interval": 20000
}
```

5. ESP32 trimite citirea catre BackendV2 `POST /embedded/readings/temperature`.
6. BackendV2 salveaza in `temperature_readings` si actualizeaza `rooms.current_temp`.
7. BackendV2 poate afisa temperatura in mobile/web.

## Flow etapa 1 - comanda lumini

1. Mobile trimite `PATCH /light-zones/:id` catre BackendV2.
2. BackendV2 valideaza camera si zona.
3. BackendV2 trimite catre ESP32 `POST /api/lights`:

```json
{
  "id_camera": "ROOM1",
  "is_on": true
}
```

4. ESP32 trimite catre ESP01 LED `POST /control`:

```json
{
  "cmd": "set_gpio",
  "val": "HIGH"
}
```

5. ESP01 LED raspunde `{"status":"ok"}`.
6. ESP32 raspunde backendului `{"status":"lights_processed"}`.
7. BackendV2 salveaza `light_zones.is_on` si `light_events`.

## Flow etapa 1 - comanda centrala

1. Mobile schimba programul camerei sau targetul termic.
2. BackendV2 salveaza programul activ.
3. BackendV2 calculeaza targetul curent pentru camera.
4. BackendV2 trimite catre ESP32 `POST /api/temp`:

```json
{
  "id_camera": "ROOM1",
  "temp": 21.0
}
```

5. ESP32 compara targetul cu temperaturile curente.
6. Daca cel putin o camera cere caldura, ESP32 trimite `HIGH` la ESP01 releu centrala.
7. Daca nicio camera nu cere caldura, ESP32 trimite `LOW`.
8. BackendV2 salveaza `boiler_events` cand primeste confirmarea/starea.

## Flow etapa 2 - usa prin Bluetooth

Aceasta etapa se implementeaza dupa ce etapa 1 functioneaza stabil.

1. Userul face login in aplicatia mobila.
2. Backendul returneaza token de sesiune si codul BLE activ pentru user.
3. Mobile stocheaza local codul BLE.
4. La usa, mobile se conecteaza prin BLE la ESP32.
5. Mobile scrie codul BLE in caracteristica BLE de access.
6. ESP32 valideaza local codul.
7. Daca este valid, ESP32 deschide zavorul.
8. ESP32 trimite evenimentul la BackendV2 cand exista conexiune.

## Endpointuri publice care trebuie pastrate

| Endpoint | Rol |
|---|---|
| `GET /health` | verificare server pentru mobile |
| `POST /auth-sessions/login` | login cu sesiune unica |
| `GET /users/me` | profil user curent |
| `POST /users/register` | creare user |
| `GET /users/presence` | prezenta utilizatori |
| `GET /users/logs` | loguri unificate |
| `GET /users/:id` | detalii user pentru admin |
| `PATCH /users/:id/suspend` | suspendare/reactivare |
| `DELETE /users/:id` | stergere user |
| `GET /rooms` | lista camere |
| `POST /rooms` | creare camera |
| `GET /rooms/:id` | detalii camera |
| `PATCH /rooms/:id/temp-program` | schimbare program termic |
| `GET /light-zones` | lista lumini |
| `POST /light-zones` | creare zona lumina |
| `PATCH /light-zones/:id` | aprindere/stingere lumina |
| `GET /heating-programs` | lista programe termice |
| `POST /heating-programs` | creare program termic |
| `DELETE /heating-programs/:id` | stergere program termic |

## Endpointuri noi pentru embedded

| Endpoint | Actor | Rol |
|---|---|---|
| `POST /embedded/register` | ESP32 -> Backend | handshake initial si configuratie |
| `POST /embedded/heartbeat` | ESP32 -> Backend | status online/offline |
| `POST /embedded/readings/temperature` | ESP32 -> Backend | citire temperatura |
| `POST /embedded/events/light` | ESP32 -> Backend | confirmare eveniment lumina |
| `POST /embedded/events/boiler` | ESP32 -> Backend | confirmare eveniment centrala |
| `GET /embedded/sync/:deviceId` | ESP32 -> Backend | preluare schimbari pending |
| `POST /embedded/sync/:deviceId/ack` | ESP32 -> Backend | confirmare sync aplicat |
| `POST /embedded/events/access` | ESP32 -> Backend | etapa 2: log acces usa |

## Endpointuri pastrate pe ESP32

| Endpoint ESP32 | Cine il apeleaza | Rol |
|---|---|---|
| `POST /api` | ESP01 senzori/buton | comunicare interna existenta |
| `POST /api/temp` | Backend | trimite target temperatura camera |
| `POST /api/lights` | Backend | aprinde/stinge lumina |
| `POST /api/rand` | Backend | seteaza interval esantionare |
| `GET /api/status` | Backend | citeste status ESP32 |
| `POST /api/sync-access-codes` | Backend | etapa 2: actualizeaza codurile BLE locale |

## Tabele baza de date

| Tabel | Ce face |
|---|---|
| `users` | utilizatori, roluri, suspendare, prezenta, hash parola, hash cod BLE |
| `auth_sessions` | sesiuni active/inactive, token hash, expirare |
| `rooms` | camere logice/hardware, temperatura curenta, program activ |
| `light_zones` | circuite lumina si stare curenta |
| `heating_programs` | programe termice cu schedule JSON |
| `temperature_readings` | istoric temperaturi primite de la ESP32 |
| `access_events` | intrari/iesiri prin usa |
| `light_events` | aprinderi/stingeri lumini |
| `boiler_events` | porniri/opriri centrala |
| `home_settings` | histerezis, antifreeze, interval citire |
| `devices` | ESP32/ESP01, IP, tip, status, ultima aparitie |
| `pending_device_sync` | schimbari de trimis catre ESP32 cand revine online |

Pentru etapa 1, `access_events` si codurile BLE pot exista in schema, dar nu sunt obligatorii pentru integrarea hardware initiala.

## Ordine de implementare BackendV2

1. Scaffold NestJS in `COD/BackendV2`.
2. Configurare TypeScript strict, lint, test, env validation.
3. Configurare PostgreSQL Docker pentru BackendV2.
4. Implementare modul database cu reset/seed controlat de `.env`.
5. Implementare entitati si repository-uri.
6. Implementare `HealthModule`.
7. Implementare `AuthSessionsModule`.
8. Implementare `UsersModule`.
9. Implementare `RoomsModule`.
10. Implementare `LightZonesModule`.
11. Implementare `HeatingProgramsModule`.
12. Implementare `EventsModule`.
13. Implementare `EspGatewayModule`.
14. Implementare client HTTP catre ESP32 pentru `/api/status`, `/api/lights`, `/api/temp`, `/api/rand`.
15. Implementare endpointuri embedded pentru `register`, `heartbeat`, temperature readings, light events si boiler events.
16. Legare `PATCH /light-zones/:id` de ESP32 `/api/lights`.
17. Legare `PATCH /rooms/:id/temp-program` de ESP32 `/api/temp`.
18. Implementare retry/pending sync cand ESP32 este offline.
19. Testare compatibilitate cu `SMARTPON`.
20. Testare flow complet etapa 1 cu ESP32 + ESP01 DHT + ESP01 LED/releu.
21. Dupa confirmare hardware, etapa 2: BLE, coduri acces, zavor si `access_events`.

## Criterii de acceptare

1. `GET /health` raspunde stabil.
2. Backendul porneste cu DB goala si creeaza seedul.
3. Loginul userului test functioneaza din mobile.
4. `ROOM1` si `ROOM2` apar in aplicatie.
5. Lumina poate fi schimbata din aplicatie si comanda ajunge la ESP32.
6. Programul termic se poate schimba si targetul ajunge la ESP32.
7. ESP32 face handshake cu backendul si primeste configuratia de etapa 1.
8. ESP01 DHT trimite temperatura la ESP32, iar BackendV2 o salveaza.
9. Lumina poate fi schimbata din aplicatie si ajunge fizic la ESP01 LED.
10. Centrala/releul poate fi pornit/oprit pe baza targetului primit.
11. Heartbeatul marcheaza ESP32 online/offline in backend.
12. BLE/zavor se testeaza abia dupa ce etapa 1 este stabila.

## Intrebari ramase inainte de start code

1. Pastram complet aplicatia mobila fara modificari sau securizam toate endpointurile si ajustam mobile-ul dupa?
2. Resetarea DB la fiecare pornire ramane doar in dev prin `DB_RESET_ON_START=true`?
3. Camerele raman fix `ROOM1` si `ROOM2` pentru demo sau permitem creare dinamica din UI dupa ce hardware-ul este stabil?
4. Pentru etapa 1, alegem IP-uri statice pe router sau ramanem pe DHCP si citim IP-urile din Serial Monitor?
5. Pentru etapa 2, folosim SHA-256 simplu pentru prototip BLE sau trecem direct la challenge-response?
