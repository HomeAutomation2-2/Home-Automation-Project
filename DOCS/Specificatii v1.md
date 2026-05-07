II. Proiectare

1. Schema arhitecturală generală
   Sistemul BlueLock este compus din șase componente care colaborează pentru a asigura funcționarea integrată a sistemului:
   Serverul cloud reprezintă nucleul sistemului, responsabil de stocarea datelor, gestionarea utilizatorilor și expunerea unui API REST prin care celelalte componente software comunică.
   Aplicația mobilă este interfața principală prin care locuitorii interacționează cu sistemul: controlul accesului fizic, al luminilor și al temperaturii.
   Website-ul oferă aceleași funcționalități ca aplicația mobilă, accesibil prin browser de pe PC sau smartphone, utilizat în special de administrator.
   Modulul ESP32 este componenta centrală a hardware-ului, responsabilă de controlul fizic al zăvorului electromagnetic, al releelor de iluminat și al electrovalvelor de încălzire, pe baza comenzilor primite și a buclelor de reglare a temperaturii.
   Modulele de temperatură citesc temperatura din fiecare cameră și o transmit periodic către ESP32 prin Wi-Fi.
   Modulul releu execută comenzile fizice pentru lumini și centrala termică, primite de la ESP32.

Comunicația dintre componente este ilustrată în diagrama de mai sus, cu protocoalele aferente fiecărui canal. 2. Modelul arhitectural
Sistemul BlueLock este construit pe o arhitectură client-server pe trei niveluri (three-tier), în care clienții (aplicația mobilă și website-ul) comunică cu serverul cloud prin HTTPS. Modulul ESP32 reprezintă o excepție parțială: deși comunică cu serverul cloud pentru sincronizarea datelor, acceptă și comenzi directe de la aplicația mobilă prin Wi-Fi local și BLE, fără a trece prin server.
_Modulul Server (de completat de echipa server) De descris: organizarea internă a serverului pe trei niveluri (API / logică de business / bază de date), tehnologia folosită pentru fiecare nivel, modelul de autentificare și autorizare bazat pe roluri, mecanismul de gestionare a sesiunilor și a tokenurilor._
_Modulul Website (de completat de echipa website) De descris: modelul arhitectural ales pentru interfața web (MVC, component-based etc.), justificarea alegerii framework-ului, modul în care se integrează cu API-ul serverului._
Aplicația mobilă urmează o arhitectură pe trei straturi: View, Stores și Services. Comunicația cu sistemele externe se realizează prin trei canale distincte:
HTTPS către server pentru funcționalitățile de depind de cloud: autentificare, administrare utilizatori, rapoarte și prezență
Wi-Fi direct către ESP32 pentru comenzile de lumini și temperatură când dispozitivul se află pe aceeași rețea locală cu ESP32, fără a trece prin server
BLE direct către ESP32 exclusiv pentru accesul fizic prin ușă, independent de conexiunea la internet și de rețeaua locală
_Modulul Embedded (de completat de echipa embedded) De descris: modelul arhitectural ales pentru ESP32 (event-driven, loop-based etc.), cum sunt organizate modulele software intern (modul BLE, modul Wi-Fi, bucla de reglare temperatură, comanda lumini), justificarea abordării alese pentru gestionarea simultană a mai multor funcționalități pe un dispozitiv cu resurse limitate._
Fluxul general de date urmează un model unidirecțional și asincron cu două variante în funcție de disponibilitatea rețelei locale. Când dispozitivul mobil se află pe aceeași rețea cu ESP32, comenzile de control sunt trimise direct, iar serverul este notificat asincron pentru înregistrarea evenimentelor. Când dispozitivul este în afara rețelei locale, toate comenzile trec prin server. Accesul fizic prin BLE rămâne întotdeauna direct, indiferent de topologia rețelei. 3. Tehnologii folosite
_Modulul Server (de completat de echipa server) De completat: limbaj, framework, bază de date, hosting, alte librării relevante._
_Modulul Website (de completat de echipa website) De completat: framework UI, limbaj, librării relevante._
Modulul Mobile foloseste:
Svelte + TypeScript
Capacitor
Capacitor BLE Plugin
Capacitor Preferences Plugin
Fetch API
Visual Studio Code + Android Studio
_Modulul Embedded (de completat de echipa embedded) De completat: mediu de dezvoltare, librării BLE și Wi-Fi, protocol de comunicație cu modulele de temperatură._ 4. Proiectarea modulului mobile
4.1. Arhitectura internă a aplicației
Aplicația mobilă BlueLock este dezvoltată ca o aplicație web progresivă împachetată nativ prin Capacitor, utilizând Svelte cu TypeScript pentru interfața utilizator. Capacitor asigură accesul la funcționalitățile native ale dispozitivului Android, în special Bluetooth Low Energy și stocarea locală securizată, expunându-le aplicației web printr-un strat de abstractizare unificat.
Alegerea Capacitor ca wrapper nativ în locul unei implementări Android native este justificată de faptul ca echipa are experiență în dezvoltare web și Capacitor oferă acces la toate funcționalitățile native necesare (BLE și stocare securizată) prin plugin-uri mature și bine documentate.
Arhitectura internă a aplicației este organizată în trei straturi cu responsabilități clare și bine delimitate, dupa pattern-ul MVVM:
Stratul de interfață utilizator (View): este compus din componente Svelte care se ocupă exclusiv de prezentarea datelor și capturarea interacțiunilor utilizatorului. Componentele nu conțin logică de business și nu accesează direct surse de date. Ele subscriu la store-uri și reacționează automat la modificările acestora.
Stratul de stare (Stores, ViewModel): este implementat prin Svelte stores și reprezintă sursa unică de adevăr pentru starea aplicației. Store-urile expun date în format gata de consum pentru componente și orchestrează apelurile către stratul de servicii. Fiecare domeniu funcțional al aplicației are un store dedicat.
Stratul de servicii (Services, Model): conține logica de acces la date și la funcționalitățile native. Serviciile se ocupă de comunicația cu serverul prin HTTPS, comunicația BLE cu ESP32 prin Capacitor și stocarea locală a datelor. Nu știu nimic despre starea aplicației sau despre interfața utilizator.
Fluxul de date este unidirecțional:

Componentele principale ale fiecărui strat:
Servicii:
AuthService = autentificare, gestiunea tokenului de sesiune, invalidarea sesiunii
BluetoothService = inițierea conexiunii BLE cu ESP32, trimiterea codului de acces, recepția confirmărilor
UserService = operațiuni CRUD pentru conturi de utilizator, disponibil doar pentru administrator
AccessService = înregistrarea evenimentelor de acces local și sincronizarea cu serverul
LightsService = trimiterea comenzilor de iluminat către server
TemperatureService = preluarea și trimiterea programelor de temperatură către server
Store-uri:
authStore = starea sesiunii curente, tokenul activ, rolul utilizatorului
accessStore = starea ușii, statusul contului, istoricul recent al evenimentelor
lightsStore = starea curentă a fiecărui circuit de iluminat
temperatureStore = programele disponibile, programul activ per cameră, temperaturile curente
userStore = lista utilizatorilor și statusurile acestora, disponibil doar pentru administrator
4.2. Schema componentelor aplicației
src/
├── routes/ # Ecrane (View)
│ ├── login/
│ │ └── +page.svelte
│ ├── dashboard/
│ │ ├── +page.svelte # Container cu tab-uri
│ │ ├── lights/
│ │ │ └── LightsTab.svelte
│ │ └── temperature/
│ │ ├── TemperatureTab.svelte
│ │ └── [roomId]/
│ │ └── +page.svelte # Pagina camerei
│ ├── access/
│ │ └── +page.svelte
│ ├── presence/
│ │ └── +page.svelte
│ └── admin/
│ ├── +page.svelte # Container cu tab-uri
│ ├── presence/
│ │ ├── PresenceTab.svelte
│ │ ├── [userId]/
│ │ │ └── +page.svelte # Profil utilizator
│ │ └── add/
│ │ └── +page.svelte # Adaugare utilizator
│ └── logs/
│ └── LogsTab.svelte
│
├── lib/
│ ├── components/ # Componente reutilizabile
│ │ ├── ProgramCard.svelte
│ │ ├── RoomCard.svelte
│ │ ├── PresenceCard.svelte
│ │ ├── LightCard.svelte
│ │ └── DayIndicator.svelte
│ │
│ ├── stores/ # Stratul de stare
│ │ ├── authStore.ts
│ │ ├── accessStore.ts
│ │ ├── lightsStore.ts
│ │ ├── temperatureStore.ts
│ │ └── userStore.ts
│ │
│ └── services/ # Stratul de servicii
│ ├── AuthService.ts
│ ├── BluetoothService.ts
│ ├── UserService.ts
│ ├── AccessService.ts
│ ├── LightsService.ts
│ └── TemperatureService.ts

Stratul de componente reutilizabile va fi rafinat pe parcursul implementării pe măsură ce pattern-urile de reutilizare devin evidente. La faza de proiectare au fost identificate componentele derivate din design: carduri de cameră, carduri de program cu indicatori de zile și timeline de temperatură, carduri de prezență și formulare de administrare utilizatori etc.
4.3. Arborescența dialogurilor

4.4. Tehnologii și medii de dezvoltare
Tehnologiile și mediu de dezvoltare folosite sunt:
Svelte + TypeScript = framework UI reactiv cu tipizare statică
Capacitor = wrapper nativ pentru Android, versiunea minimă Android 8.0 (API level 26)
Capacitor BLE Plugin = acces la Bluetooth Low Energy pentru comunicația cu ESP32
Capacitor Preferences Plugin = stocare locală securizată pentru tokenul de sesiune și codul BLE
Fetch API = comunicația HTTPS cu serverul, cu interceptori pentru atașarea automată a tokenului de sesiune
Android Studio = mediu de dezvoltare pentru build și deployment pe dispozitive Android
Visual Studio Code = mediu de dezvoltare pentru interfata si functionalitate, cu testare in browser sau live deploy pe dispozitive Android
4.5. Sistemul de operare
Aplicația este compatibilă exclusiv cu dispozitive Android, versiunea minimă 8.0 (API level 26), necesară pentru suportul complet al Bluetooth Low Energy utilizat în comunicația cu ESP32. 5. Proiectarea modulului server
5.1. Arhitectura internă
modelul arhitectural ales (MVC, three-tier etc.)
5.2. Schema componentelor
diagrama modulelor principale (autentificare, gestiune utilizatori, API endpoints, bază de date)
5.3. Tehnologii și mediu de dezvoltare
limbaj, framework (Node/Django/Spring etc.), baza de date, hosting
5.4. Modelul bazei de date
diagrama entitate-relație
5.5. Descrierea API-ului
endpoint-uri, structura request/response
5.6. Securitate
implementarea HTTPS, gestiunea tokenurilor, criptarea parolelor 6. Proiectarea modulului web
6.1. Arhitectura internă
modelul arhitectural ales (MVC, component-based etc.)
6.2. Schema componentelor
paginile principale și navigarea între ele
6.3. Tehnologii și mediu de dezvoltare
framework (React/Vue/Angular etc.), librării folosite
6.4. Arborescența dialogurilor
similar cu mobile, structura paginilor și navigarea
6.5. Responsive design
cum se adaptează interfața pe dimensiuni diferite de ecran 7. Proiectarea modulului embedded
7.1. Arhitectura internă
schema modulelor software din ESP32 (modul BT, modul Wi-Fi, bucla de reglare temperatură, comanda lumini)
7.2. Schema hardware
diagrama conexiunilor fizice dintre ESP32, relee, senzori și module de temperatură
7.3. Tehnologii și mediu de dezvoltare
Arduino IDE, librării BLE și Wi-Fi folosite
7.4. Descrierea buclei de reglare
algoritmul de control biopozițional cu histerezis
7.5. Protocolul de comunicație BLE
structura mesajelor schimbate cu aplicația mobilă
7.6. Sincronizarea cu serverul
mecanismul de actualizare a tabelei de coduri și a programelor de temperatură
7.8. Diagrame de stare
stările ESP32 (idle, procesare acces, comanda lumini, reglare temperatură)
