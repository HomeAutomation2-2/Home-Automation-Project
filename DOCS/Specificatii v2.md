# Sistem de gestiune a accesului și home automation

Coordonator:  
(dr.ing.prof…..)Crișan-Vida Mihaela Marcella

## Echipa

- Crișan Alex-Florin - Programator șef - Server
- Cucea Ioan - Progamator adjunct - Mobile
- Cioclei Ana-Maria - Secretar - Web
- Covaciu Sebastian-Adelin - Server
- Cocotian Riana-Alexandra - Web
- Cornea Theodor-Marc - Web
- Cornaschi Cosmin-Ionut - Mobile
- Chituță Claudiu - Mobile
- Crișan Laurentiu-Andrei - Embedded
- Cismariu Tudor-Șerban - Embedded

## Cuprins

1. Prefata
2. Nume de cod
3. Introducere
4. Cerinte functionale
4.1. Modulul Mobile
4.2. Modulul Server
4.3. Modulul Embedded
4.4. Modulul Web
5. Cerinte nefunctionale
5.1. Modulul Mobile
5.2. Modulul Server
5.3. Modulul Embedded
5.4. Modulul Web
6. Analiză de risc și funcționare degradată
6.1 Bluetooth indisponibil pe dispozitivul mobil
6.2. Pierderea conexiunii la internet pe dispozitivul mobil
6.3. Indisponibilitatea serverului cloud
6.4. Indisponibilitatea modulului ESP32
6.5. Compromiterea unui dispozitiv mobil
7. Arhitectura sistemului
8. Cazuri de utilizare si diagrame de secventa
8.1. Solicitare acces prin Bluetooth
8.2. Aprindere/Stingere lumini
8.3. Schimbare program temperatură
8.4. Vizualizare log acces și prezență
8.5. Adăugare utilizator
8.6. Suspendare/Reactivare utilizator
8.7. Ștergere utilizator
9. Interfete cu alte sisteme
9.1. Smartphone - ESP32
9.2. Smartphone - Server
9.3. ESP32 - Server
9.4. Modulele de temperatură - ESP32
10. Evolutia sistemului
10.1 Analiză SWOT
11. Planificarea lucrarilor
11.1. Modelul de ciclu de viață
11.2. Diagrama Gantt
12. Anexe
12.1. Interfata cu utilizatorul
12.2. Tabele baze de date

## I. Specificatii

### 1. Prefata

Prezentul proiect a demarat în data de 26.03.2026 prin prezentarea unei teme tehnice la sediul companiei noastre de către ???(nuhs ce titluri are) Crișan-Vida Mihaela Marcella, reprezentantul Universității Politehnica Timișoara, care cu aceasta a solicitat demararea realizării unui Sistem de gestiune a accesului și home automation.

### 2. Nume de cod

Sistemul a fost denumit comercial BlueLock, nume care surprinde esența produsului într-un mod atractiv și sugestiv. Prefixul Blue face referire la tehnologia Bluetooth prin care utilizatorii interacționează cu sistemul, în timp ce Lock evocă controlul accesului și siguranța locuinței. Împreună, cele două componente ale numelui comunică rapid și intuitiv propunerea de valoare a produsului: o soluție modernă de automatizare rezidențială, construită în jurul unui acces securizat și ușor de utilizat.

### 3. Introducere

În contextul actual, în care automatizarea tinde să simplifice majoritatea aspectelor vieții cotidiene, locuințele private rămân adesea în urmă din perspectiva gestionării inteligente a parametrilor de confort și securitate. Această problemă se accentuează în cazul locuințelor ocupate de mai multe persoane, unde evidența prezenței, controlul accesului și managementul sistemelor de iluminat și încălzire devin dificil de coordonat fără un instrument centralizat. În plus, gestionarea accesului persoanelor care nu sunt ocupanți permanenți, dar care necesită acces ocazional, reprezintă o provocare suplimentară de securitate.
BlueLock răspunde acestor nevoi prin intermediul unui sistem integrat de home automation, care centralizează controlul accesului fizic, al iluminatului și al încălzirii într-o singură platformă, accesibilă de pe dispozitive mobile. Sistemul permite utilizatorilor autorizați să monitorizeze și să controleze parametrii locuinței în timp real, indiferent dacă se află în incintă sau la distanță. Accesul fizic este gestionat printr-un mecanism securizat de identificare prin Bluetooth, iar confortul termic este asigurat prin bucle de reglare automată cu programe configurabile.
Sistemul interacționează cu trei categorii de componente externe: modulul ESP32, responsabil de comanda locală a releelor și a zăvorului electromagnetic, modulele de temperatură cu conexiune Wi-Fi, montate în fiecare cameră, și componenta cloud, care centralizează datele și permite accesul de la distanță prin intermediul aplicației mobile. Împreună, aceste componente formează un ecosistem autonom care se integrează natural în rutina zilnică a ocupanților, reducând efortul de administrare a locuinței la câteva interacțiuni simple cu telefonul.

### 4. Cerinte functionale

#### 4.1. Modulul Mobile

F1. Autentificarea și gestiunea sesiunii unice. Aplicația asigură autentificarea utilizatorului prin credențiale validate de componenta cloud, în urma căreia se emite un token de sesiune unic și un cod de identificare Bluetooth, generate server-side. Tokenul de sesiune invalidează automat orice sesiune activă anterioară, garantând că un cont este activ pe un singur dispozitiv la un moment dat. La detectarea invalidării tokenului, aplicația deloghează utilizatorul și solicită re-autentificarea.
F2. Controlul accesului fizic prin Bluetooth. Aplicația permite solicitarea deschiderii ușii de acces printr-un schimb de mesaje securizat cu modulul ESP32, realizat exclusiv prin Bluetooth, fără dependență de conexiunea la cloud în momentul accesului. Înainte de trimiterea codului, aplicația verifică local statusul contului: conturile active transmit codul către ESP32, iar conturile suspendate sunt blocate la nivel de interfață. Aplicația afișează în permanență ora curentă, starea ușii și direcția ultimului acces.
F3. Înregistrarea și sincronizarea evenimentelor de acces. Fiecare eveniment de intrare sau ieșire este înregistrat local cu data, ora și identitatea persoanei, și transmis asincron către componenta cloud la restabilirea conexiunii. Această abordare asigură integritatea datelor de acces chiar și în absența temporară a conexiunii la internet.
F4. Controlul iluminatului. Aplicația permite activarea și dezactivarea luminilor din fiecare cameră prin comenzi transmise către modulul ESP32 prin intermediul componentei cloud sau direct modulului ESP32 dacă ambele dispozitive se afla pe aceeași rețea Wi-Fi. Starea curentă a fiecărui circuit de iluminat este afișată în timp real.
F5. Gestiunea programelor de temperatură. Aplicația permite configurarea și selectarea programelor de temperatură pentru fiecare buclă de reglare. Un program definește temperatura de referință, histerezisul, offsetul senzorului și intervalele orare de funcționare, diferențiate pe zile ale saptamanii. Utilizatorul poate forța tranziția imediată către un alt program, înlocuind orarul activ.
F6. Monitorizarea prezenței și vizualizarea rapoartelor. Aplicația oferă o vedere în timp real a persoanelor prezente în locuință, precum și acces la istoricul evenimentelor de acces și grafice de evoluție a temperaturilor. Vizualizarea rapoartelor complete este condiționată de o permisiune acordată explicit de administrator pentru fiecare cont în parte.
F7. Administrarea utilizatorilor. Administratorul poate crea și gestiona conturile ocupanților locuinței direct din aplicație. La crearea unui cont se înregistrează numele, prenumele și CNP-ul utilizatorului, iar codul de identificare Bluetooth este generat automat de server și transmis aplicației, eliminând necesitatea introducerii manuale.

#### 4.2. Modulul Server

F1. Autentificarea și gestiunea sesiunii unice. Serverul validează credențialele utilizatorului, emite token de sesiune și invalidează automat orice sesiune activă anterioară a aceluiași cont, asigurând politica single-device.
F2. Administrarea utilizatorilor și rolurilor. Serverul oferă operațiuni de creare, actualizare, suspendare, reactivare și ștergere utilizatori, cu aplicarea drepturilor pe roluri (administrator, locatar).
F3. Generarea și rotația codurilor Bluetooth. Serverul generează coduri de acces unice per utilizator, regenerează codurile la suspendare/reactivare și propagă modificările către ESP32 pentru menținerea consistenței autorizării.
F4. Persistența și sincronizarea evenimentelor. Serverul colectează evenimentele de acces, prezență, comenzi de lumini, modificări de temperatură și stări de dispozitiv, le validează și le stochează cu timestamp și identitatea actorului.
F5. Orchestrarea controlului de iluminat și temperatură. Serverul primește comenzile din aplicațiile client, transmite instrucțiunile către ESP32, procesează confirmările și menține starea curentă a sistemelor controlate.
F6. Managementul programelor termice. Serverul gestionează programe de temperatură pe camere/bucle, inclusiv setpoint, histerezis, offset și intervale orare, cu posibilitatea de override manual.
F7. Expunerea interfețelor API pentru clienți. Serverul expune endpoint-uri REST securizate pentru aplicația mobilă și aplicația web, acoperind autentificare, administrare utilizatori, control dispozitive, prezență și raportare.

#### 4.3. Modulul Embedded

(similar cu ce e la mobile, dar specific modulului vostru)

#### 4.4. Modulul Web

F1. Autentificarea în interfața web. Aplicația web permite autentificarea utilizatorilor autorizați, menține sesiunea activă și aplică delogarea automată la invalidarea tokenului.
F2. Dashboard operațional în timp real. Interfața web afișează starea ușii, prezența ocupanților, starea luminilor și parametrii termici curenți, pe baza datelor furnizate de server.
F3. Controlul iluminatului. Utilizatorul poate aprinde sau stinge circuitele de iluminat din interfața web, iar aplicația transmite comenzile către server și afișează rezultatul execuției.
F4. Controlul temperaturii și al programelor. Interfața web permite selectarea și schimbarea programelor termice, inclusiv forțarea unui program activ pentru fiecare buclă de reglare.
F5. Administrarea utilizatorilor. Rolul de administrator poate crea, suspenda, reactiva și șterge utilizatori din interfața web, cu validări și mesaje explicite de rezultat.
F6. Vizualizarea logurilor și rapoartelor. Aplicația web permite consultarea istoricului de acces, a statusului de prezență și a evoluției temperaturilor, cu filtre de timp și utilizator.
F7. Interfață responsive. Funcționalitățile critice sunt accesibile atât pe desktop, cât și pe browser mobil, fără pierderea funcțiilor principale de operare.

### 5. Cerinte nefunctionale

#### 5.1. Modulul Mobile

NF1. Performanță și timp de răspuns. Aplicația trebuie să inițieze și să finalizeze handshake-ul Bluetooth cu modulul ESP32 în maximum 3 secunde de la apăsarea butonului de acces, pentru a nu crea întârzieri perceptibile la intrarea în locuință. Sincronizarea cu serverul (inclusiv actualizarea codului de acces și a statusului contului) trebuie finalizată în maximum 5 secunde în condiții normale de conectivitate. Interfața utilizator trebuie să rămână responsivă pe durata operațiunilor de rețea, acestea fiind executate asincron în fundal.
NF2. Securitatea comunicației Bluetooth. Comunicația dintre aplicație și modulul ESP32 se realizează printr-un mecanism de identificare bazat pe coduri de acces generate și gestionate server-side. Codul de acces este transmis aplicației după autentificarea cu succes și este regenerat automat de server la suspendarea sau reactivarea contului. Aplicația nu are acces la logica de generare sau validare a codului, aceasta fiind responsabilitatea exclusivă a serverului, respectiv a modulului ESP32. În absența conexiunii la server, codul stocat local rămâne valid, asigurând funcționalitatea de acces prin Bluetooth și în mod offline.
NF3. Securitatea sesiunii și restricția single-device. Fiecare autentificare generează un token de sesiune unic, care este invalidat automat la autentificarea aceluiași cont pe un alt dispozitiv. Astfel, un cont poate fi activ pe un singur dispozitiv la un moment dat. La detectarea invalidării tokenului, aplicația deloghează utilizatorul și solicită reautentificarea. Tokenul de sesiune și codul de acces Bluetooth sunt generate exclusiv server-side și transmise aplicației după autentificarea cu succes, niciuna dintre acestea nefiind derivată local pe dispozitiv.
NF4. Confidențialitatea datelor. Întreaga comunicație dintre aplicație și componenta cloud se realizează exclusiv prin HTTPS, prevenind interceptarea datelor în tranzit. Datele stocate local pe dispozitiv (inclusiv tokenul de sesiune și codul de acces Bluetooth) sunt stocate în zone de memorie protejate ale sistemului de operare Android, inaccesibile altor aplicații. Codul de acces Bluetooth nu este afișat niciodată în interfața utilizator.
NF5. Disponibilitate și funcționare în mod offline. Aplicația este proiectată să funcționeze parțial în absența conexiunii la internet. Funcționalitatea de acces prin Bluetooth nu depinde de conexiunea la cloud și rămâne disponibilă atât timp cât codul local nu a expirat. Evenimentele de acces produse în mod offline sunt stocate local și sincronizate cu serverul la restabilirea conexiunii. Funcționalitățile care necesită obligatoriu conexiunea la server (comanda luminilor, modificarea programelor de temperatură, administrarea utilizatorilor) sunt dezactivate și marcate explicit în interfață în absența conectivității.
NF6. Restricții de platformă și dispozitiv. Aplicația este compatibilă exclusiv cu dispozitive Android, necesitând versiunea minimă Android 8.0 (API level 26) pentru suportul complet al funcționalităților Bluetooth Low Energy utilizate în comunicația cu ESP32. Dispozitivul trebuie să dispună de modul Bluetooth activ pentru funcționalitatea de acces, și de conexiune la internet pentru funcționalitățile cloud. Un cont de utilizator poate fi asociat unui singur dispozitiv la un moment dat, asocierea fiind gestionată server-side la autentificare.

#### 5.2. Modulul Server

NF1. Performanță și timp de răspuns API. Endpoint-urile critice (autentificare, acces, control, status) trebuie să răspundă în timpi predictibili, fără blocaje care afectează experiența utilizatorilor.
NF2. Disponibilitate și reziliență operațională. Componenta server trebuie să suporte restarturi controlate și reconectări ale modulelor fără pierderi de consistență în datele critice.
NF3. Securitatea comunicației și a datelor. Toate comunicațiile cu clienții se fac prin HTTPS, iar datele sensibile (parole, tokenuri, coduri de acces) sunt tratate conform practicilor de securitate server-side.
NF4. Integritate tranzacțională. Operațiunile administrative critice (suspendare/reactivare/ștergere utilizator și rotație cod Bluetooth) trebuie executate atomic pentru a evita stări intermediare invalide.
NF5. Auditabilitate și trasabilitate. Serverul trebuie să înregistreze acțiunile administrative, schimbările de status și erorile operaționale cu actor, timestamp și rezultat.
NF6. Scalabilitate modulară. Arhitectura serverului trebuie să permită extinderea numărului de utilizatori, dispozitive și evenimente fără modificarea contractelor publice de API.

#### 5.3. Modulul Embedded

(similar cu ce e la mobile, dar specific modulului vostru)

#### 5.4. Modulul Web

NF1. Performanță percepută în interfață. Aplicația web trebuie să ofere feedback rapid la acțiunile utilizatorului (navigare, comenzi, formulare), fără blocarea interfeței.
NF2. Compatibilitate pe browsere moderne. Interfața web trebuie să funcționeze stabil pe browsere desktop și mobile utilizate curent în mediul de producție.
NF3. Securitate client-side. Datele de sesiune trebuie gestionate în mod sigur, iar aplicația web nu trebuie să expună în interfață informații sensibile precum coduri de acces Bluetooth.
NF4. Claritate operațională și UX. Pentru fiecare eroare de comunicație sau validare, aplicația web trebuie să afișeze mesaje clare, acționabile și corelate cu cauza.
NF5. Responsive design. Toate ecranele principale (dashboard, administrare, rapoarte) trebuie să rămână utilizabile pe rezoluții diferite, inclusiv pe dispozitive mobile.
NF6. Fiabilitate la întreruperi de rețea. Aplicația web trebuie să trateze explicit timeout-uri și indisponibilități server, cu mecanisme de reîncercare controlată și reîmprospătare de stare.

### 6. Analiză de risc și funcționare degradată

Sistemul BlueLock interacționează cu componente fizice și de rețea a căror indisponibilitate poate afecta parțial sau total funcționarea ansamblului. Mai jos sunt prezentate scenariile de cădere în ordinea crescătoare a consecințelor asupra funcționării sistemului.

#### 6.1 Bluetooth indisponibil pe dispozitivul mobil

Consecințe: Accesul fizic prin ușă este imposibil pentru utilizatorul al cărui dispozitiv nu are Bluetooth activ sau funcțional. Restul funcționalităților aplicației (control lumini, temperatură, rapoarte) rămân disponibile dacă există conexiune la internet.
Reacție dezirabilă: Aplicația detectează absența Bluetooth-ului și dezactivează explicit butonul de acces, afișând un mesaj explicativ. Utilizatorul nu rămâne blocat fără explicație.
Măsuri de diminuare: Accesul fizic poate fi acordat de un alt ocupant al locuinței prezent la ușă, prin propriul dispozitiv.

#### 6.2. Pierderea conexiunii la internet pe dispozitivul mobil

Consecințe: Funcționalitățile care depind de cloud devin indisponibile: comanda luminilor, modificarea programelor de temperatură, administrarea utilizatorilor și sincronizarea evenimentelor de acces. Accesul fizic prin Bluetooth rămâne funcțional, codul stocat local fiind valid în absența conexiunii.
Reacție dezirabilă: Aplicația afișează un banner persistent care indică absența conexiunii și dezactivează explicit funcționalitățile cloud-dependente. Evenimentele de acces produse offline sunt stocate local și sincronizate automat la restabilirea conexiunii.
Măsuri de diminuare: Funcționalitatea critică (accesul fizic) este proiectată să nu depindă de internet, limitând impactul acestui scenariu la funcționalitățile secundare.

#### 6.3. Indisponibilitatea serverului cloud

Consecințe: Similar cu punctul precedent din perspectiva aplicației mobile. Suplimentar, rotația codurilor Bluetooth se oprește: codurile existente rămân valide, dar suspendarea unui cont nu produce efect imediat pe dispozitivele offline. Autentificarea de pe dispozitive noi este imposibilă.
Reacție dezirabilă: Aplicația tratează indisponibilitatea serverului identic cu lipsa conexiunii la internet, afișând același banner și păstrând funcționalitatea offline. La revenirea serverului, sincronizarea evenimentelor și actualizarea codurilor se realizează automat.
Măsuri de diminuare: Serverul ar trebui să implementeze mecanisme de recuperare automată.

#### 6.4. Indisponibilitatea modulului ESP32

Consecințe: Accesul fizic prin ușă este imposibil pentru toți utilizatorii, indiferent de starea conexiunii la internet. Comenzile de lumini și temperatură trimise din aplicație nu produc efect, deși pot fi transmise. Înregistrarea evenimentelor de acces se oprește.
Reacție dezirabilă: Aplicația nu primește confirmare de la ESP32 și afișează un mesaj de eroare după expirarea timpului de așteptare. Comenzile eșuate nu sunt stocate local pentru retrimitere, deoarece starea fizică a luminilor și temperaturii la momentul revenirii ESP32 este necunoscută.
Măsuri de diminuare: ESP32 ar trebui să transmită un semnal de disponibilitate periodic către server, astfel încât aplicația să poată detecta proactiv indisponibilitatea și să informeze utilizatorul înainte ca acesta să încerce accesul.

#### 6.5. Compromiterea unui dispozitiv mobil

Consecințe: Un dispozitiv pierdut sau furat poate fi folosit pentru acces neautorizat în locuință atât timp cât codul Bluetooth stocat local este valid.
Reacție dezirabilă: Administratorul suspendă imediat contul asociat dispozitivului din aplicația web sau de pe alt dispozitiv. Serverul generează un cod nou care nu este transmis dispozitivului compromis, invalidând accesul. Modulul ESP32 este actualizat la următoarea sincronizare.
Măsuri de diminuare: Timpul de expunere între pierderea dispozitivului și suspendarea contului depinde exclusiv de reacția administratorului. Sistemul nu implementează un mecanism automat de revocare în absența unei acțiuni explicite din partea administratorului.

#### 6.6. Indisponibilitatea bazei de date

Consecințe: Serverul nu mai poate procesa autentificări noi, operațiuni administrative și persistarea evenimentelor, iar aplicația web nu mai poate afișa informații actualizate.
Reacție dezirabilă: Sistemul semnalizează explicit indisponibilitatea, limitează operațiunile la cele care nu compromit consistența și respinge controlat cererile care necesită acces la date persistente.
Măsuri de diminuare: Se recomandă backup-uri periodice, monitorizare continuă a sănătății bazei de date și proceduri documentate de restore pentru reducerea timpului de recuperare.

#### 6.7. Degradarea API-ului server (latență ridicată sau timeout)

Consecințe: Comenzile din aplicația web și mobilă ajung cu întârziere sau eșuează, iar utilizatorii percep sistemul ca instabil.
Reacție dezirabilă: Clienții afișează timeout clar și starea de comandă nereușită, iar serverul aplică limitare de trafic și prioritizare pentru operațiile critice.
Măsuri de diminuare: Se recomandă monitorizare de performanță pe endpoint-uri, optimizare interogări, caching pentru datele frecvent accesate și scalare incrementală a serviciilor.

#### 6.8. Indisponibilitatea aplicației web

Consecințe: Funcțiile de administrare și raportare disponibile în browser devin inaccesibile, ceea ce întârzie operațiunile de suport și management.
Reacție dezirabilă: Utilizatorii sunt informați explicit despre indisponibilitate, iar operațiile critice sunt redirecționate temporar către aplicația mobilă, dacă rolul și contextul permit.
Măsuri de diminuare: Se recomandă deployment redundant, verificări automate de sănătate și mecanisme de rollback rapid la ultima versiune stabilă.

### 7. Arhitectura sistemului

(introdu imaginea din tema tehnica +- modificarile aduse de Serban)

### 8. Cazuri de utilizare si diagrame de secventa

#### 8.1. Solicitare acces prin Bluetooth

Starea inițială: ESP32 este funcțional și are tabela de coduri sincronizată. Utilizatorul se află în apropierea ușii de acces și deschide ecranul de acces. Aplicația verifică imediat la navigarea pe ecranul de acces două condiții:
disponibilitatea Bluetooth-ului pe dispozitiv
statusul local al contului
Dacă Bluetooth-ul este indisponibil, butonul de acces este dezactivat și se afișează un mesaj persistent până la activarea acestuia. Dacă statusul contului este suspendat, butonul de acces este dezactivat și se afișează un mesaj de suspendare. Butonul de deblocare este afișat activ doar dacă ambele condiții sunt îndeplinite.
Actori implicați: Utilizator, ESP32, Server

Flux normal:
Utilizatorul vede butonul de deblocare activ (ambele verificări au trecut cu succes)
Utilizatorul apasă butonul de deblocare
Aplicația inițiază conexiunea Bluetooth cu ESP32
Aplicația transmite codul de acces către ESP32
ESP32 verifică codul în tabela locală
Codul fiind valid, ESP32 comandă deschiderea zăvorului
Aplicația primește confirmarea și afișează starea ușii ca deschisă
Evenimentul de acces este înregistrat local și transmis asincron către server
După intervalul prestabilit, ESP32 comandă închiderea automată a zăvorului
Aplicația actualizează starea ușii ca închisă

Fluxuri anormale:
Cont suspendat, aplicație offline: La pasul 5, ESP32 nu găsește codul în tabelă (codul a fost invalidat la suspendare). ESP32 refuză accesul și transmite răspuns negativ. Aplicația afișează mesaj de acces refuzat.
ESP32 indisponibil: La pasul 3, conexiunea Bluetooth eșuează după expirarea timpului de așteptare. Aplicația afișează mesaj de eroare și sugerează reîncercarea.
Activități simultane: Sincronizarea periodică a codului de acces cu serverul rulează în fundal independent de fluxul de acces.
Starea finală: Ușa este închisă. Evenimentul de acces este înregistrat local și în curs de sincronizare cu serverul dacă există conexiune la internet.
Date procesate: Cod de acces Bluetooth, ID utilizator, timestamp eveniment, direcție acces (intrare/ieșire), status ușă.
Stimuli: Apăsarea butonului de deblocare.
Răspuns la stimuli: Deschiderea zăvorului și confirmarea vizuală în aplicație, sau mesaj de eroare corespunzător cazului anormal.
Diagrama starilor usii:

#### 8.2. Aprindere/Stingere lumini

Starea inițială: Utilizatorul se află pe ecranul Dashboard, tab-ul Lumini. Aplicația afișează starea curentă a fiecărui circuit de iluminat, preluată de la server. Conexiunea la internet este activă.
Actori implicați: Locuitor, Server, ESP32

Flux normal:
Utilizatorul vede starea curentă a luminilor pentru fiecare cameră
Utilizatorul apasă toggle-ul pentru o cameră
Aplicația trimite comanda către server
Serverul transmite comanda către ESP32
ESP32 execută comanda și confirmă serverului
Serverul confirmă aplicației
Aplicația actualizează starea toggle-ului în interfață
Evenimentul este înregistrat în server cu timestamp și identitatea utilizatorului

Fluxuri anormale:
Conexiune internet indisponibilă: La intrarea pe ecran, aplicația detectează absența conexiunii și dezactivează toate toggle-urile, afișând un mesaj persistent. Comanda nu poate fi trimisă în mod offline deoarece starea fizică a luminilor nu poate fi confirmată.
ESP32 indisponibil: La pasul 5, serverul nu primește confirmare de la ESP32 după expirarea timpului de așteptare. Serverul notifică aplicația că comanda nu a putut fi executată. Aplicația revine la starea anterioară a toggle-ului și afișează mesaj de eroare.
Comandă în curs: Dacă utilizatorul apasă toggle-ul în timp ce o comandă anterioară este în curs de procesare, toggle-ul este dezactivat temporar până la primirea confirmării, prevenind comenzi simultane contradictorii pe același circuit.
Activități simultane: Alte funcționalități ale aplicației (acces, temperatură, rapoarte) rămân disponibile în timpul procesării comenzii.
Starea finală: Starea luminii este actualizată fizic și reflectată în interfață. Evenimentul este înregistrat în server.
Date procesate: ID cameră, stare nouă (on/off), ID utilizator, timestamp.
Stimuli: Apăsarea toggle-ului pentru un circuit de iluminat.
Răspuns la stimuli: Actualizarea stării luminii și confirmarea vizuală în interfață, sau revenirea la starea anterioară și mesaj de eroare în caz de eșec.

#### 8.3. Schimbare program temperatură

Starea inițială: Utilizatorul se află pe ecranul Dashboard, tab-ul Temperatură. Aplicația afișează pentru fiecare cameră temperatura curentă, temperatura țintă și programul activ. Conexiunea la internet este activă.
Actori implicați: Locuitor, Server, ESP32

Flux normal:
Utilizatorul apasă pe cardul unei camere
Aplicația afișează lista programelor disponibile
Utilizatorul selectează un program nou
Utilizatorul confirmă selecția
Aplicația trimite comanda către server
Serverul actualizează programul activ și transmite noii parametri către ESP32
ESP32 confirmă primirea și aplică noul program
Aplicația actualizează cardul camerei cu noul program activ

Fluxuri anormale:
Conexiune internet indisponibilă: La intrarea pe ecran, aplicația dezactivează posibilitatea de a schimba programul și afișează un mesaj persistent. Programul activ continuă să ruleze pe ESP32 independent de conexiunea la internet.
ESP32 indisponibil: La pasul 7, serverul nu primește confirmare de la ESP32. Serverul notifică aplicația că programul nu a putut fi aplicat. Aplicația revine la programul anterior și afișează mesaj de eroare.
Activități simultane: ESP32 continuă să execute programul curent până la primirea confirmării noului program.
Starea finală: Noul program este activ pe ESP32. Cardul camerei reflectă programul nou, temperatura țintă și următoarea schimbare de interval.
Date procesate: ID cameră, ID program nou, ID utilizator, timestamp.
Stimuli: Selectarea și confirmarea unui program nou din lista de programe.
Răspuns la stimuli: Actualizarea programului activ în interfață și pe ESP32, sau revenirea la programul anterior și mesaj de eroare în caz de eșec.

#### 8.4. Vizualizare log acces și prezență

Starea inițială: Utilizatorul are permisiunea de vizualizare a rapoartelor activată de administrator. Utilizatorul se află pe ecranul Prezență. Conexiunea la internet este activă.
Actori implicați: Locuitor cu permisiune de rapoarte, Administrator, Server

Flux normal:
Utilizatorul navighează pe ecranul Prezență
Aplicația solicită de la server lista persoanelor și statusul lor curent
Aplicația afișează lista ocupanților cu statusul acasă/plecat și ora ultimului eveniment
Utilizatorul poate accesa logul detaliat de evenimente
Aplicația solicită și afișează istoricul evenimentelor de acces în ordine cronologică inversă

Fluxuri anormale:
Utilizator fără permisiune de rapoarte: Ecranul Prezență afișează doar statusul live al ocupanților (cine e acasă și cine nu) fără acces la logul detaliat. Butonul de acces la loguri nu este afișat.
Conexiune internet indisponibilă: Aplicația afișează ultimele date disponibile din cache local, cu o indicație că informațiile pot să nu fie actualizate.
Activități simultane: Evenimentele noi de acces sunt adăugate în timp real la log pe măsură ce se produc.
Starea finală: Utilizatorul a vizualizat statusul curent și istoricul evenimentelor de acces.
Date procesate: ID utilizator, lista ocupanți, statusuri prezență, istoric evenimente cu timestamp și direcție acces.
Stimuli: Navigarea pe ecranul Prezență și accesarea logului detaliat.
Răspuns la stimuli: Afișarea statusurilor curente și a istoricului de evenimente.

#### 8.5. Adăugare utilizator

Starea inițială: Utilizatorul autentificat are rol de administrator. Se află pe ecranul Admin, tab-ul Prezență. Conexiunea la internet este activă.
Actori implicați: Administrator, Server, ESP32

Flux normal:
Administratorul apasă butonul de adăugare utilizator nou
Aplicația afișează formularul de creare cont
Administratorul introduce numele, prenumele și CNP-ul noului utilizator
Administratorul confirmă crearea contului
Aplicația trimite datele către server
Serverul validează unicitatea CNP-ului
Serverul creează contul și generează codul de acces Bluetooth
Serverul transmite noul rând către tabela ESP32
Aplicația afișează confirmarea creării contului

Fluxuri anormale:
CNP duplicat: La pasul 6, serverul detectează că CNP-ul există deja în sistem și returnează eroare. Aplicația afișează mesaj de eroare specific și menține formularul deschis pentru corecție.
Conexiune internet indisponibilă: Formularul de adăugare este dezactivat și se afișează un mesaj că operațiunea necesită conexiune la internet.
ESP32 indisponibil: La pasul 8, serverul nu poate actualiza tabela ESP32. Contul este creat în server dar marcat ca nesincronizat. Sincronizarea se realizează automat la revenirea ESP32.
Activități simultane: Generarea codului Bluetooth și actualizarea tabelei ESP32 se realizează asincron după crearea contului.
Starea finală: Contul nou este creat în server, codul Bluetooth este generat și tabela ESP32 este actualizată. Noul utilizator poate instala aplicația și se poate autentifica.
Date procesate: Nume, prenume, CNP, cod Bluetooth generat, ID utilizator nou creat.
Stimuli: Completarea și confirmarea formularului de creare cont.
Răspuns la stimuli: Confirmarea creării contului sau mesaj de eroare specific.

#### 8.6. Suspendare/Reactivare utilizator

Starea inițială: Utilizatorul autentificat are rol de administrator. Se află pe profilul unui utilizator existent. Conexiunea la internet este activă.
Actori implicați: Administrator, Server, ESP32

Flux normal — Suspendare:
Administratorul apasă butonul de suspendare de pe profilul utilizatorului
Aplicația afișează dialog de confirmare
Administratorul confirmă suspendarea
Aplicația trimite comanda către server
Serverul marchează contul ca suspendat și generează un cod Bluetooth nou
Serverul actualizează tabela ESP32 cu noul cod
Aplicația actualizează statusul contului în interfață

Flux normal — Reactivare:
Administratorul apasă butonul de reactivare de pe profilul utilizatorului suspendat
Aplicația afișează dialog de confirmare
Administratorul confirmă reactivarea
Aplicația trimite comanda către server
Serverul marchează contul ca activ și generează un cod Bluetooth nou
Serverul actualizează tabela ESP32 cu noul cod
La următoarea autentificare a utilizatorului, aplicația primește noul cod

Fluxuri anormale:
ESP32 indisponibil: La pasul 6, serverul nu poate actualiza tabela ESP32 imediat. Actualizarea este marcată ca în așteptare și se realizează automat la revenirea ESP32. Până atunci, codul vechi rămâne valid în tabela ESP32 — acesta este singurul scenariu în care suspendarea nu produce efect imediat.
Conexiune internet indisponibilă: Operațiunea nu este disponibilă offline și se afișează mesaj corespunzător.
Activități simultane: Invalidarea sesiunii utilizatorului suspendat și actualizarea tabelei ESP32 se realizează asincron și independent.
Starea finală:
Suspendare: Contul este suspendat, codul vechi este invalid în tabela ESP32, utilizatorul nu poate accesa ușa.
Reactivare: Contul este activ, un cod nou este generat și sincronizat cu ESP32, utilizatorul poate accesa ușa după reautentificare.
Date procesate: ID utilizator, status cont nou, cod Bluetooth nou generat, timestamp operațiune, ID administrator.
Stimuli: Confirmarea acțiunii de suspendare sau reactivare.
Răspuns la stimuli: Actualizarea statusului contului în interfață și propagarea modificărilor către server și ESP32.
Starile contului utilizatorului:

#### 8.7. Ștergere utilizator

Starea inițială: Utilizatorul autentificat are rol de administrator. Se află pe profilul unui utilizator existent. Conexiunea la internet este activă.
Actori implicați: Administrator, Server, ESP32

Flux normal:
Administratorul apasă butonul de ștergere de pe profilul utilizatorului
Aplicația afișează dialog de confirmare cu avertisment că acțiunea este ireversibilă
Administratorul confirmă ștergerea
Aplicația trimite comanda către server
Serverul șterge contul
Serverul transmite comanda de ștergere a rândului din tabela ESP32
Serverul arhivează istoricul evenimentelor de acces asociate contului
Aplicația navighează înapoi la lista de utilizatori și confirmă ștergerea

Fluxuri anormale:
ESP32 indisponibil: La pasul 6, ștergerea din tabela ESP32 este marcată ca în așteptare. Până la sincronizare, codul utilizatorului șters rămâne valid în tabela ESP32. Serverul marchează codul ca invalid, astfel încât la următoarea sincronizare ștergerea se realizează automat.
Conexiune internet indisponibilă: Operațiunea nu este disponibilă offline.
Activități simultane: Arhivarea istoricului de evenimente se realizează asincron după ștergerea contului.
Starea finală: Contul este șters, sesiunea este invalidată, rândul din tabela ESP32 este eliminat, istoricul evenimentelor este arhivat și nu mai este accesibil prin interfață.
Date procesate: ID utilizator șters, timestamp operațiune, ID administrator.
Stimuli: Confirmarea acțiunii de ștergere.
Răspuns la stimuli: Confirmarea ștergerii și navigarea înapoi la lista de utilizatori, sau mesaj de eroare în caz de eșec.

### 9. Interfete cu alte sisteme

#### 9.1. Smartphone - ESP32

Modul de comunicare: Comunicația se realizează prin Bluetooth Low Energy (BLE), tehnologie wireless cu rază scurtă de acțiune (aproximativ 10 metri) și consum redus de energie. Nu necesită conexiune la internet sau infrastructură de rețea intermediară, ceea ce o face independentă de disponibilitatea serverului cloud.
Protocolul de comunicare: Se utilizează protocolul Bluetooth Low Energy (BLE), standard IEEE 802.15.1, în care ESP32 acționează ca periferic iar aplicația mobilă acționează ca central. Schimbul de date se realizează prin caracteristici GATT dedicate, câte una pentru trimiterea codului de acces și una pentru primirea confirmării.
Structura și semnificația informației transmise:
Aplicație → ESP32:
Cod de acces Bluetooth — șir de caractere unic per utilizator, generat server-side, utilizat pentru identificarea și autorizarea accesului
ESP32 → Aplicație:
Confirmare acces acordat — ușa a fost deblocată
Confirmare acces refuzat — codul nu există în tabela locală
Confirmare stare ușă — deschisă/închisă

#### 9.2. Smartphone - Server

Modul de comunicare: Comunicația se realizează prin Wi-Fi sau rețea mobilă (3G/4G/5G), prin intermediul internetului. Această interfață este necesară pentru toate funcționalitățile cloud-dependente ale aplicației și nu este disponibilă în absența conexiunii la internet.
Protocolul de comunicare: Se utilizează HTTPS, protocol standard pentru comunicația securizată între aplicații mobile și servere web. Toate datele transmise sunt criptate end-to-end, prevenind interceptarea în tranzit. Comunicația urmează arhitectura REST, în care aplicația trimite cereri HTTP către endpoint-uri specifice ale serverului și primește răspunsuri în format JSON.
Structura și semnificația informației transmise:
Aplicație → Server:
Credențiale de autentificare = username și parolă la login
Comenzi de control = aprindere/stingere lumini, schimbare program temperatură
Evenimente de acces înregistrate offline = sincronizare la restabilirea conexiunii
Date utilizator nou = nume, prenume, CNP la crearea unui cont
Comenzi de administrare = suspendare, reactivare, ștergere cont
Server → Aplicație:
Token de sesiune = emis la autentificarea cu succes, utilizat pentru autorizarea cererilor ulterioare
Cod de acces Bluetooth = generat server-side, transmis la autentificare și la fiecare regenerare
Status conturi = activ, suspendat, șters
Date prezență = lista ocupanților și statusul acasă/plecat
Istoric evenimente = loguri de acces, aprinderi/stingeri lumini, modificări temperatură
Confirmare comenzi = răspuns la comenzile trimise de aplicație
Notificări = alerte despre evenimente importante (cont suspendat, ESP32 indisponibil)

#### 9.3. ESP32 - Server

(la fel ca mai sus)

#### 9.4. Modulele de temperatură - ESP32

(la fel ca mai sus)

### 10. Evolutia sistemului

Sistemul BlueLock este construit în jurul unor tehnologii și standarde larg adoptate, ceea ce îi conferă o bază solidă pentru evoluție. Totuși, există câteva ipoteze de funcționare care pot influența direcția de dezvoltare viitoare.
Comunicația dintre aplicația mobilă și modulul ESP32 se bazează pe Bluetooth Low Energy, un standard matur și larg suportat pe dispozitivele Android. Înlocuirea modulului ESP32 cu un alt hardware compatibil BLE nu ar necesita modificări în aplicația mobilă, atât timp cât protocolul de comunicație și structura mesajelor rămân neschimbate. În schimb, modificarea protocolului de comunicație (de exemplu trecerea la NFC) ar necesita modificări semnificative atât în aplicație cât și în modulul embedded.
Comunicația dintre aplicație și server se realizează prin REST, un standard universal în aplicațiile mobile. Această alegere permite înlocuirea sau scalarea componentei server fără impact asupra aplicației mobile, atât timp cât contractul API rămâne consistent. Introducerea de funcționalități noi pe server se poate realiza prin adăugarea de endpoint-uri noi, fără a afecta funcționalitățile existente.
Sistemul este proiectat pentru o singură locuință, cu un număr limitat de utilizatori și camere. O eventuală extindere către gestionarea mai multor locuințe de către același utilizator (spre exemplu o casă de vacanță) ar necesita modificări la nivelul arhitecturii serverului și al interfeței aplicației mobile, care în prezent nu este concepută pentru a gestiona contexte multiple.
Dependența de platforma Android reprezintă o limitare în contextul în care o parte din utilizatori ar putea folosi dispozitive iOS. O extindere către iOS ar necesita fie o implementare nativă separată, fie migrarea către o tehnologie cross-platform precum Flutter sau React Native.
Mecanismul de rotație a codurilor Bluetooth este proiectat pentru a funcționa cu un singur ESP32. Într-un scenariu de extindere cu mai multe puncte de acces (de exemplu o ușă de garaj sau o intrare secundară) arhitectura de sincronizare a codurilor ar trebui revizuită pentru a acoperi mai multe tabele pe mai multe dispozitive embedded.

#### 10.1 Analiză SWOT

Puncte tari (Strengths)
Funcționalitate offline pentru acces. Deblocarea ușii nu depinde de conexiunea la internet, ceea ce îl diferențiază de soluțiile cloud-only și îl face mai fiabil în situații de conectivitate redusă
Mecanism de securitate robust. Rotația codurilor Bluetooth la suspendarea contului elimină necesitatea verificării statusului în timp real de către ESP32, simplificând arhitectura și reducând latența la acces
Interfață unificată. Controlul accesului, iluminatului și temperaturii dintr-o singură aplicație reduce nevoia de multiple aplicații dedicate
Arhitectură bazată pe standarde. BLE, HTTPS și REST sunt tehnologii mature, larg documentate și suportate

Puncte slabe (Weaknesses)
Disponibilitate limitată la Android. Excluderea utilizatorilor iOS restrânge baza potențială de utilizatori.
Dependență de un singur dispozitiv per cont. Constrângerea single-device, deși justificată din perspectiva securității, poate fi inconvenientă pentru utilizatorii care folosesc mai multe dispozitive.
Scalabilitate limitată. Sistemul este proiectat explicit pentru o singură locuință cu un număr redus de utilizatori și camere, fără o cale clară de extindere.
Recuperare manuală la compromiterea unui dispozitiv. Nu există un mecanism automat de revocare a accesului în caz de pierdere a dispozitivului, depinzând exclusiv de reacția administratorului.

Oportunități (Opportunities)
Creșterea pieței de home automation. Tendința generală de automatizare rezidențială creează un context favorabil pentru adoptarea unor soluții integrate precum BlueLock.
Extindere către iOS. Adoptarea unei tehnologii cross-platform ar putea extinde semnificativ baza de utilizatori fără a rescrie logica de business.
Integrare cu asistenți vocali. Compatibilitatea cu Google Assistant sau Amazon Alexa ar adăuga un canal de interacțiune suplimentar, în special pentru controlul luminilor și temperaturii.
Extindere multi-locuință. Gestionarea mai multor proprietăți din aceeași aplicație reprezintă o oportunitate naturală de evoluție pentru utilizatorii cu mai multe locuințe.

Amenințări (Threats)
Competiție cu soluții existente. Platforme precum Google Home, Apple HomeKit sau Amazon Alexa oferă ecosisteme mature cu suport larg pentru dispozitive terțe, față de care BlueLock are o integrare hardware limitată.
Evoluția standardelor Bluetooth. O schimbare majoră în protocolul BLE sau adoptarea unui alt standard de comunicație la distanță scurtă ar putea necesita revizuirea arhitecturii de acces.
Cerințe de securitate în creștere. Reglementările privind protecția datelor personale și securitatea dispozitivelor IoT sunt în continuă evoluție și pot impune modificări arhitecturale viitoare.
Dependența de infrastructura cloud. Indisponibilitatea prelungită a serverului afectează toate funcționalitățile cloud-dependente și poate eroda încrederea utilizatorilor în sistem.

### 11. Planificarea lucrarilor

#### 11.1. Modelul de ciclu de viață

Pentru dezvoltarea sistemului BlueLock propunem modelul Agile cu sprint-uri de trei săptămâni, justificat prin următoarele considerente:
Echipa este împărțită pe patru componente independente (server, mobile, embedded și website) care pot fi dezvoltate în paralel, cu puncte de sincronizare la sfârșitul fiecărui sprint. Modelul Agile permite livrarea incrementală a funcționalităților și ajustarea rapidă a cerințelor pe parcurs, ceea ce e important într-un proiect unde interfețele dintre module sunt definite pe parcurs și pot necesita ajustări.

#### 11.2. Diagrama Gantt

### 12. Anexe

#### 12.1. Interfata cu utilizatorul

#### 12.2. Tabele baze de date

Structura bazei de date server (conform `COD/DATABASES/schema.sql`) include urmatoarele tabele:

- **Identitate si acces:** `roles`, `users`, `auth_sessions`, `user_devices`
- **Locuinta si dispozitive:** `homes`, `rooms`, `devices`, `room_devices`
- **Control acces:** `access_points`, `access_events`, `presence_status`
- **Iluminat:** `light_zones`, `light_commands`, `light_events`
- **Incalzire:** `heating_loops`, `heating_profiles`, `heating_schedule_entries`, `heating_overrides`, `temperature_readings`, `heating_demands`, `valve_events`, `boiler_controller`, `boiler_events`
- **Monitorizare dispozitive:** `device_status_log`

Stocare locala mobile (conceptual):

- sesiune curenta (token, expirare)
- status conectivitate si preferinte aplicatie
- coada de evenimente generate offline pentru sincronizare ulterioara
- cache de stari (prezenta, lumini, temperaturi) pentru afisare rapida

Tabela de coduri embedded (ESP32, conceptual):

- identificator utilizator
- hash cod acces Bluetooth activ
- versiune/epoca cod (pentru rotatie)
- status activ/suspendat
- timestamp ultima sincronizare cu serverul
