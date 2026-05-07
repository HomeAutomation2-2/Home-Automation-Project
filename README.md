# 🏠 SmartAccess & Thermal Guard: Integrated IoT Ecosystem
### **Sistem enterprise de management al accesului BLE și optimizare termică.**
> Proiect realizat de **Echipa Enn**

---

## 🎯 1. Viziune și Business (Pentru "Vizionari")

### **Obiectivul Proiectului**
Transformarea conceptului de "Smart Home" dintr-un simplu gadget într-o soluție robustă de securitate și eficiență. Sistemul automatizează accesul securizat în incintă prin **BLE Numeric Comparison** și reglează climatizarea folosind algoritmi de tip **Histerezis**, reducând consumul energetic cu până la **20%**.

### **Valoare Adăugată**
* **Securitate fără compromis:** Eliminarea parolelor statice prin *Device Binding* și semnături digitale unice generate în enclava hardware a smartphone-ului.
* **Interfață Unificată:** Monitorizare în timp real prin dashboard-uri web responsive (**Next.js**) și control mobil ultra-rapid (**Svelte**).
* **Analiză de Date:** Istoric complet al accesului și al variațiilor de temperatură, stocat eficient într-o bază de date relațională optimizată (**PostgreSQL**).

### **Arhitectura Conceptuală**
Sistemul utilizează o arhitectură de tip **Event-Driven**, comunicând prin protocolul **MQTT** pentru latență minimă și **WebSockets** pentru actualizări "live" în browser.

---

## 🛠️ 2. Detalii Tehnice (Pentru "Devi")

### **Stiva Tehnologică (The Stack)**
| Componentă | Tehnologie | Detalii |
| :--- | :--- | :--- |
| **Backend** | ![NestJS]  | Arhitectură modulară (Dependency Injection) |
| **Web Frontend** | ![Next.js] | Randare hibridă și optimizare automată |
| **Mobile App** | ![Svelte] | Capacitor pentru performanță nativă |
| **Embedded** | ![C++] | ESP-IDF Framework (ESP32 & ESP8266) |
| **Database** | ![PostgreSQL] | Sursă unică de adevăr pentru permisiuni |

### **Structura Repozitorului**
Conform normativului de management (regula de 8 caractere):
* `/COD/ARDUINOU` - Firmware ESP32 Gateway (ESP-IDF).
* `/COD/SENZWIRES` - Firmware ESP8266 Senzori Temperatură.
* `/COD/SMARTPON` - Aplicație Mobilă Svelte.
* `/COD/WEBSERVRS` - Monorepo: `/backend` (NestJS) & `/frontend` (Next.js).
* `/COD/DATABASES` - Scheme SQL și migrări Postgres.
* `/DOCS` - Documentația oficială (SPE, PRO, TES, MAN, OPI).

### **Configurație Hardware**
| Modul | Componentă | Rol | Conectivitate |
| :--- | :--- | :--- | :--- |
| **Gateway** | ESP32 | Validare Acces + Hub | BLE & Wi-Fi |
| **Senzor** | ESP8266 + DHT11 | Citire Temperatură | Wi-Fi (MQTT) |
| **Actuator** | Releu 5V | Comandă Zăvor/Lumină | GPIO 4 / 5 |

---

## 🚀 3. Ghid de Pornire Rapidă (Quick Start)

### **Pre-cerințe**
* Node.js v20+
* Docker (pentru Postgres & MQTT Broker)
* ESP-IDF SDK v5.x

### **Instalare (3 Pași)**

1.  **Infrastructură:**
    ```bash
    docker-compose up -d  # Pornește Postgres & MQTT Broker
    ```
2.  **Backend:**
    ```bash
    cd COD/WEBSERVRS/backend && npm install && npm run start:dev
    ```
3.  **Frontend:**
    ```bash
    cd COD/WEBSERVRS/frontend && npm install && npm run dev
    ```

---

## 🔒 4. Securitate și Deployment
* **Deployment:** Aplicațiile sunt containerizate prin **Docker** pentru consistență între medii.
* **Provisioning:** Asocierea între Smartphone și ESP32 se face printr-un proces securizat bazat pe codul **PUK unic** al fiecărui locatar.

---

## 👥 5. Echipa Proiectului

| Nume și Prenume | Rol în Proiect | Responsabilitate Principală |
| :--- | :--- | :--- |
| **Crișan Alex-Florin** | Programator Șef | Arhitectură Sistem & Integrare NestJS |
| **Cucea Ioan** | Adjunct | Managementul Bazei de Date & API |
| **Cioclei Ana-Maria** | Secretar | Documentație SPE/PRO & Management OPI |
| **Covaciu Sebastian-Adelin** | Programator | Dezvoltare Embedded (ESP-IDF) |
| **Cocotian Riana-Alexandra**| Programator | Frontend Next.js & UX Design |
| **Cornea Theodor-Marc** | Programator | Aplicație Mobilă Svelte |
| **Cornaschi Cosmin-Ionut** | Programator | Logica de Control Termic (Histerezis) |
| **Crișan Laurentiu-Andrei**| Programator | Securitate BLE & Numeric Comparison |
| **Cismariu Tudor-Șerban** | Programator | Testare Automată & DevOps (CI/CD) |

---
*Acest proiect este dezvoltat sub licența **MIT**. Toate documentele oficiale pot fi găsite în folderul `/DOCS` conform structurii de management solicitate.*
