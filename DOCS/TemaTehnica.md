TEMA TEHNICĂ
SISTEM DE HOME AUTOMATION
Se cere realizarea unui sistem de gestiune a parametrilor controlabili electric din
incinta unei case private. Sistemul va ține evidența prezenței acasă a proprietarilor, controlul
și comanda iluminatului și sistemului de încălzire. Aceasta se va realiza prin citirea datelor de
identificare ale celor intră/ies din casă, prin intermediul unei aplicații speciale instalate pe
SmartPhone-ul utilizatorului, prin conexiune Bluetooth cu ESP32, de asemenea prin controlul
luminilor cu relee comandate prin comenzi transmise de la Smartphone și controlul
sistemului de încălzire prin intermediul unor bucle de reglare cu senzori de temperatură și
comenzi către electrovalve de încălzire.
Sistemul va permite administrarea listei persoanelor care au acces în casă, respectiv
a orarelor de schimbare a referințelor de temperatură, precum și generarea de rapoarte de
acces și grafice de evoluție a temperaturilor în diverse încăperi.
În Figura 1 este prezentată arhitectura sistemului:
Fig. 1. Arhitectura sistemului
Tema tehnică – Sistem de gestiune a accesului
Autor: Ionescu Gheorghe
Vers. 1.1 15.02.2026 Page 2
Descrierea sistemului

1. Sistemul de programe va fi compus din 5 module: o aplicație pentru Smartphone pentru
   solicitarea accesului prin comunicare prin Bluetooth, o aplicație ESP32 pentru validarea
   accesului cu modul Bluetooth și comanda zăvorului electromagnetic de acces, respectiv
   pentru comanda luminilor și a încălzirii, o aplicație pentru modulele de temperatură
   inteligente cu conexiune Wi-Fi pentru pornirea centralei, o aplicație Cloud pentru
   administrarea utilizatorilor, setarea temperaturilor, comanda luminilor și raportări diverse,
   care poate fi accesată prin intermediul unei interfețe WEB responsive, atât de pe PC cât și
   de pe Smartphone Android, precum și o aplicație special concepută pentru Smartphone
   (app), cu aceleași funcționalități ca mai sus.
2. Programul de solicitare a accesului, care va rula pe Smartphone, va realiza
   următoarele:
   2.1. Va afișa în permanență:

- ora curentă
- starea ușii de acces (închis, deschis)
- în caz de acces autorizat se afișează numele persoanei și sensul (intrare
  sau ieșire)
  2.2. Va valida intrarea/ieșirea prin preluarea informațiilor securizate de validare doar
  pentru persoanele cu drept de acces, prin preluarea prin Bluetooth a informațiilor
  securizate de validare;
  2.3. Toate intrările/ieșirile sunt înregistrate într-o bază de date locală și transmise în
  cloud, însoțite de data/ora producerii lor și de indicarea persoanei care a intrat/ieșit;
  2.4. Lista de persoane intrate/ieșite, respectiv log-ul de acces pot fi vizualizate de
  utilizatorii autorizați.

3. Programul din modulul ESP32 va realiza următoarele:
   3.1. Va recepționa și valida/invalida codurile de acces primate de la Smartphone-urile
   locuitorilor casei prin Bluetooth; dacă codul de acces este valid, va comanda zăvorul
   ușii de acces un timp prestabilit; un Led va simula acționarea zăvorului;
   3.2. Va comanda luminile (simulate prin Led-uri) la primirea unor comenzi în acest
   sens de la aplicația de comandă de pe Smartphone (fie versiunea WEB fie app).
   3.3. Va citi temperaturile de la senzori de temperatură (din cele 2 camere conectați
   prin Wi-Fi) și va comanda electrovalve de calorifer (simulate prin Led-uri) prin bucle
   de reglare bipoziționale cu histerezis, ținând cont de un orar de schimbare a
   referințelor de temperatură; va comanda centrala (comanda va fi simulată printr-un
   Led) dacă cel puțin o buclă de temperatură va genera comandă de electrovalvă și va
   opri centrala dacă nici o buclă de temperatură nu generează comandă. Perioada de
   eșantionare va fi setabilă (1 min, 5 min, 10 min, 30 min).
   3.4. Va comunica în Cloud pentru a prelua parametrii de temperatură (referințe,
   histerezis, offset, programe zilnice uzuale și de week-end cu mai multe seturi de
   valori și orele de schimbare, inclusiv program distinct de concediu) și va transmite
   evenimentele, însoțite de data/ora producerii (intrări/ieșiri, aprinderi/stingeri de
   lumină, pornire/oprire central termică) pentru a fi înregistrate; va transmite periodic
   temperaturile citite, cu o periodicitate egală cu perioada de eșantionare, pentru a fi de
   asemenea înregistrate.
4. Programul din modulul de temperatură va citi temperatura de la senzorul de
   temperatură și va transmite periodic temperatura prin Wi-Fi la modulul ESP32, la aceeași
   perioadă de eșantionare ca cea specificată la pct. 3.3.
5. Componenta cloud va permite:
   4.1. Evidenţa utilizatorilor; sistemul va asocia unic un locuitor al casei cu un
   Smartphone; un utilizator privilegiat de tip administrator va putea crea utilizatori noi;
   pentru fiecare dintre aceștia se va înregistra

- Nume, prenume
  Tema tehnică – Sistem de gestiune a accesului
  Autor: Ionescu Gheorghe
  Vers. 1.1 15.02.2026 Page 3
- CNP
- Codul de securitate specific pentru identificarea prin Bluetooth
  4.2. Fiecare utilizator trebuie să se autentifice.
  4.3. Urmărirea prezenței în casă, prin înregistrarea orelor de intrare/ieșire.
  4.4. Setarea parametrilor de temperatură prin stabillirea programelor pentru fiecare
  buclă de reglare (refrerințe, histertezis, offset, orele de schimbare a referințelor (2—4
  schimbări pe zi, programe uzuale, pe zile, de week-end, de concediu).
  4.5. Înregistrarea valorilor de tip eveniment și a temperaturilor, ca la pct. 3.4.
  4.6. Comanda luminilor și forțarea unor programe de încălzire (spre exemplu trecere
  la un program de încălzire uzuală la plecarea spre casă);
  4.7. Generare de rapoarte (listare de evenimente, curbe de temperatură, rapoarte de
  prezență în casă).
  4.8. Funcțiile se implementează prin intermediul unor interfețe WEB responsive.

6. Se va dezvolta și un app cu aceleași funcționalități ca la pct. 4, care se va putea instala
   într-un singur exemplar, pe un singur Smartphone, fiind asociată unei caracteristici
   personalizate (codul PUK), pentru fiecare utilizator în parte; proiectanții vor defini o strategie
   de desfășurare (deployment) care să permită ușoara instalare a tuturor aplicațiilor necesare
   pe telefoanele locatarilor.
   Întocmit: ing. Ionescu Gheorghe Semnătură
   15.02.2026
   Tema tehnică – Sistem de gestiune a accesului
   Autor: Ionescu Gheorghe
   Vers. 1.1 15.02.2026 Page 4
   Această pagină nu face parte din Tema tehnică, deoarece clientul nu e interesat şi
   nu ştie cum poate fi realizat un model experimental şi nici măcar la ce e bun acesta.
   Paragraful acesta este o indicaţie “internă”, didactică.
   Sistemul de comandă va conține

- 1 modul ESP32 https://www.emag.ro/placa-esp32-cu-esp-wroom-32-38-
  pini-cu-cip-cp2102-multicolor-esp32-cp2102-
  yellow/pd/D7R798MBM/?ref=history-shopping_414761387_38837_1
  2 module temperatura - https://www.optimusdigital.ro/ro/senzori-senzori-deumiditate/12427-placa-senzor-de-temperatura-i-umiditate-dht11-modul-esp01s.html?search_query=esp-01&results=630
  2 module releu - https://sigmanortec.ro/Kit-releu-cu-ESP8266-ESP-01Sp161362162
  1 modul care citeste un buton
  https://sigmanortec.ro/Modul-Wifi-ESP8266-Transreceiver-p134711871
  https://sigmanortec.ro/Modul-adaptor-ESP-01-ESP8266-p192538782
- Led-uri de simulare a comezilor
- mediu de dezvoltare Arduino IDE
  E binevenită realizarea unui stand (machetă) care să imite realitatea.

  Etapa Obiective/Componente Detalii
  Echipa Metoda Programatorului-Sef Echipa ideala 5-7 persoane; Roluri: Sef (cel mai bun tehnic) Ajutor (inlocuitor) Secretar (documentatie)
  Partea 1: Specificatii Cerinte Functionale 4-8 functii principale descrise succint (1-3 fraze); evidentiere cu bold
  Partea 1: Specificatii Cerinte Nefunctionale Performanta siguranta disponibilitate restrictii I/O analiza de risc
  Partea 1: Specificatii Modelare UML Cazuri de utilizare (Use Cases) Diagrame de secventa Diagrame de stare
  Partea 1: Specificatii Planificare Analiza SWOT si Diagrama GANTT (Microsoft Project)
  Partea 2: Proiectare Arhitectura Componente interactiuni tehnologii (client-server 3-tier)
  Partea 2: Proiectare Module Intrari prelucrari iesiri pentru fiecare componenta
  Partea 2: Proiectare Baze de Date Schema relationala normalizare indecsi chei primare
  Partea 3: Implementare Documentatie Teste Caiet de sarcini pentru teste sistem integrare si acceptanta
  Partea 3: Implementare Scenarii de Test Mijloace tehnice conditii de functionare si verificare (intrari vs. asteptari)
  Final Livrabile obligatorii Specificatii Proiectare Teste Marketing Management PPT Prototip
  Final Prezentare PPT Maxim 10 minute focus pe diagrame/imagini culori sobre

LONGER Version
Sectiune Sub-sectiune Detalii si Explicatii
Organizare Echipa Modelul Programatorului-sef Activitatea este condusa de un proiectant experimentat (arhitect/team leader). Echipa ideala este de 5-7 persoane.
Organizare Echipa Rol: Programator-sef Cel mai bun profesionist; preia partile dificile (drivere, interactiuni timp real); distribuie sarcini; controleaza modulele; sustine avizarile.
Organizare Echipa Rol: Ajutor Al doilea in ierarhie; trebuie sa cunoasca proiectul in detaliu pentru a prelua conducerea in caz de forta majora.
Organizare Echipa Rol: Secretar Degreveaza echipa de rutina: devize, acte contabile, documentatie tehnica, interfata client, agende sedinte, urmarire termene.
Partea 1: SPECIFICATII Obiective Analiza temei tehnice si scrierea specificatiilor. Descrierea interfetelor dintre aplicatie ("cutie neagra") si mediu (utilizatori, alte sisteme).
Partea 1: SPECIFICATII Memoriu Tehnic Denumire proiect, Prefata (istoric demarare), Nume de cod (sugestiv/comercial), Introducere (necesitate, obiective, performante).
Partea 1: SPECIFICATII Glosar de termeni Definirea termenilor tehnici pentru a fi intelesi de persoane fara expertiza (inclusiv reprezentantii clientului).
Partea 1: SPECIFICATII Cerinte Functionale 4-8 functii identificate; descrise in 1-3 fraze; grup de cuvinte caracteristic evidentiat cu "bold". Trebuie sa transpună sintetic tema.
Partea 1: SPECIFICATII Cerinte Nefunctionale Legate de siguranta, timp raspuns, spatiu stocare, disponibilitate, restrictii I/O, conformitate cu standarde.
Partea 1: SPECIFICATII Analiza de risc Evaluarea sigurantei; analiza in functionare degradata (ierarhizarea caderilor de componente si consecintele acestora asupra bunei functionari).
Partea 1: SPECIFICATII Arhitectura sistemului Schema calculatorului/retelei pe care ruleaza aplicatia; periferice folosite; interactiunea cu utilizatori si alte sisteme externe.
Partea 1: SPECIFICATII Specificatii cerinte (UML) Cazuri de utilizare (Use Cases), Diagrame de secventa, Diagrame de stare. Recomandat editor specializat (ex: StarUML).
Partea 1: SPECIFICATII Evolutia sistemului Ipoteze de functionare viitoare (schimbari hardware/cerinte). Analiza SWOT obligatorie (puncte tari, slabe, oportunitati, amenintari).
Partea 1: SPECIFICATII Planificarea lucrarilor Model ciclu de viata justificat si grafic de esalonare a lucrarilor (Diagrama GANTT, recomandat Microsoft Project).
Partea 1: SPECIFICATII Interfata utilizator (Anexa) Aspect ecrane, meniuri, submeniuri, mesaje sistem, rapoarte, arborescenta dialogurilor posibile, desene ilustrative complete.
Partea 1: SPECIFICATII Baze de date (Logic) Definire campuri tabele la nivel de continut (nu marime). Fara efort de proiectare (normalizare/indecsi) in aceasta etapa.
Partea 2: PROIECTARE Obiectiv Descriere care permite delimitarea muncii in echipa si codificarea ca activitate de rutina. Rezulta o arhitectura si descrierea componentelor.
Partea 2: PROIECTARE Arhitectura programului Schema generala, tehnologii folosite (client-server, three-tier), detalii OS, arborescenta parcurgere dialoguri, Diagrame clase UML.
Partea 2: PROIECTARE Descrierea modulelor Intrari; prelucrari; iesiri si interactiuni pentru fiecare componenta de program. Se foloseste un sablon de descriere unitar.
Partea 2: PROIECTARE Comunicare intre module Descriere canale de comunicatie, lista parametri, semnificatii, restrictii. Se utilizeaza tabele si Diagrame de secventa UML.
Partea 2: PROIECTARE Baze de date (Fizic) Tip, lungime, restrictii campuri, drepturi acces, legaturi intre tabele, indecsi, chei primare, normalizare.
Partea 3: IMPLEMENTARE Obiectiv Transpunerea principiului conformabilitatii. Realizarea prototipului functional si scrierea documentatiei pentru testele de sistem.
Partea 3: IMPLEMENTARE Documentatie Teste Informatii pentru un tert: ce sa testeze (acces la specificatii), mijloace tehnice folosite, functionalitati testate, intrari si reactii asteptate.
Partea 3: IMPLEMENTARE Scenariu Verificare Tertul studiaza doc, solicita mijloace tehnice (PC, standuri), stabileste conditii, verifica functionalitatile linie cu linie din tabelul de teste.
Partea 3: IMPLEMENTARE Structura Doc Teste Generalitati (Nume, Istoric, Arhitectura sistem), Mijloace verificare (config PC, standuri simulare, OS), Conditii functionare, Conditii verificare.
ASPECTE FINALE Livrabile obligatorii Specificatii, Documentatie Proiectare, Teste Acceptanta (Caiet Sarcini), Plan Marketing, Dosar Management Proiect, Prezentare PPT, Prototip.
ASPECTE FINALE Dosar Management Coperta semnata, Cuprins, Echipa (atribucii), Diagrama Gantt, Tabel task-uri, Lista documente, Pontaj (ore/om), PV avizare.
ASPECTE FINALE Plan Marketing Calcul costuri, Segment-tinta, Comparatie concurenta, Pret justificat, Preliminare vanzari pe 2 ani, Campanie marketing, Analiza riscuri.
ASPECTE FINALE Prezentare PPT Maxim 10 minute (<30 sec/slide). Continut: Arhitectura, Functii, Tehnologie, BD, Comunicare, Interfete, Solutii tehnice, Prototip, Gantt, Marketing.
ASPECTE FINALE Recomandari PPT Culori sobre, fonturi mari/simple, max 2-3 marimi font, texte scurte (enumerari), multe imagini/diagrame, animatie discreta.

// Tehnologii folosite

🛠️ 2. Detalii Tehnice (Pentru "Devi")
Stiva Tehnologică (The Stack)
Componentă Tehnologie Detalii
Backend ![NestJS] Arhitectură modulară (Dependency Injection)
Web Frontend ![Next.js] Randare hibridă și optimizare automată
Mobile App ![Svelte] Capacitor pentru performanță nativă
Embedded ![C++] ESP-IDF Framework (ESP32 & ESP8266)
Database ![PostgreSQL] Sursă unică de adevăr pentru permisiuni
Structura Repozitorului
Conform normativului de management (regula de 8 caractere):

/COD/ARDUINOU - Firmware ESP32 Gateway (ESP-IDF).
/COD/SENZWIRES - Firmware ESP8266 Senzori Temperatură.
/COD/SMARTPON - Aplicație Mobilă Svelte.
/COD/WEBSERVRS - Monorepo: /backend (NestJS) & /frontend (Next.js).
/COD/DATABASES - Scheme SQL și migrări Postgres.
/DOCS - Documentația oficială (SPE, PRO, TES, MAN, OPI).
Configurație Hardware
Modul Componentă Rol Conectivitate
Gateway ESP32 Validare Acces + Hub BLE & Wi-Fi
Senzor ESP8266 + DHT11 Citire Temperatură Wi-Fi (MQTT)
Actuator Releu 5V Comandă Zăvor/Lumină GPIO 4 / 5
