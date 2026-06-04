# 🧪 Teste Unitare — Backend Home Automation

> **Total: 53 teste | 8 suite-uri | Timp de execuție: ~4s**
>
> Toate testele rulează în memorie cu repository-uri mock-uite — nu este nevoie de PostgreSQL.

```bash
# Rulare teste
npm test -- --verbose

# Rulare cu acoperire (coverage)
npm test -- --coverage
```

---

## 📁 Structură fișiere de test

```
src/
├── app.controller.spec.ts                          (1 test)
├── users/
│   └── users.spec.ts                               (19 teste)
├── rooms/
│   └── rooms.spec.ts                               (9 teste)
├── light-zones/
│   └── light-zones.spec.ts                         (10 teste)
├── temperature-programs/
│   └── temperature-programs.spec.ts                (4 teste)
├── auth-sessions/
│   └── auth-sessions.spec.ts                       (4 teste)
├── home-settings/
│   └── home-settings.spec.ts                       (4 teste)
└── events/
    └── events.spec.ts                              (2 teste)

test/
└── users/
    └── users-flow.e2e-spec.ts                      (teste E2E — necesită DB)
```

---

## 1. AppController — `app.controller.spec.ts`

| # | Test | Tip |
|---|------|-----|
| 1 | Returnează statusul `"ok"` și numele aplicației (`Dev Bluelock v0.0`) | ✅ Happy path |

---

## 2. UsersService — `users/users.spec.ts`

### findByPhone

| # | Test | Tip |
|---|------|-----|
| 1 | Returnează utilizatorul dacă există | ✅ Happy path |
| 2 | Returnează `null` dacă utilizatorul nu există | ⚪ Edge case |

### registerAccount

| # | Test | Tip |
|---|------|-----|
| 3 | Creează utilizatorul și returnează datele fără `passwordHash` | ✅ Happy path |
| 4 | Aruncă `ConflictException` dacă telefonul sau CNP-ul există deja | ❌ Error path |
| 5 | Hash-uiește parola înainte de a salva (verifică `bcrypt.hash`) | 🔒 Securitate |

### loginUser

| # | Test | Tip |
|---|------|-----|
| 6 | Autentifică utilizatorul și returnează datele fără `passwordHash` | ✅ Happy path |
| 7 | Aruncă `NotFoundException` dacă numărul de telefon nu există | ❌ Error path |
| 8 | Aruncă `UnauthorizedException` dacă parola este incorectă | ❌ Error path |
| 9 | Aruncă `UnauthorizedException` dacă contul este suspendat | ❌ Error path |

### getFormattedProfile

| # | Test | Tip |
|---|------|-----|
| 10 | Returnează profilul formatat cu ultimul eveniment de acces | ✅ Happy path |
| 11 | Returnează `"No access history"` dacă nu există evenimente | ⚪ Edge case |
| 12 | Aruncă `NotFoundException` dacă utilizatorul nu există | ❌ Error path |

### getDetailedProfileForAdmin

| # | Test | Tip |
|---|------|-----|
| 13 | Returnează profilul detaliat al utilizatorului | ✅ Happy path |
| 14 | Aruncă `NotFoundException` dacă utilizatorul nu există | ❌ Error path |

### suspendUser

| # | Test | Tip |
|---|------|-----|
| 15 | Suspendă utilizatorul și invalidează sesiunile active | ✅ Happy path |
| 16 | Reactivează utilizatorul fără a invalida sesiunile | ⚪ Edge case |
| 17 | Aruncă `NotFoundException` dacă utilizatorul nu există | ❌ Error path |

### deleteUser

| # | Test | Tip |
|---|------|-----|
| 18 | Șterge sesiunile și apoi utilizatorul (ordinea FK) | ✅ Happy path |
| 19 | Aruncă `NotFoundException` dacă utilizatorul nu există | ❌ Error path |

---

## 3. RoomsService — `rooms/rooms.spec.ts`

### findAll

| # | Test | Tip |
|---|------|-----|
| 1 | Returnează toate camerele | ✅ Happy path |

### createRoom

| # | Test | Tip |
|---|------|-----|
| 2 | Creează și returnează o cameră nouă | ✅ Happy path |
| 3 | Aruncă `ConflictException` dacă numele camerei există deja | ❌ Error path |

### getRoom

| # | Test | Tip |
|---|------|-----|
| 4 | Returnează camera dacă există | ✅ Happy path |
| 5 | Aruncă `NotFoundException` dacă camera nu există | ❌ Error path |

### setTempProgramId

| # | Test | Tip |
|---|------|-----|
| 6 | Actualizează programul de temperatură al camerei | ✅ Happy path |
| 7 | Setează `program_id` pe `null` (detașare program) | ⚪ Edge case |
| 8 | Aruncă `NotFoundException` dacă programul nu există | ❌ Error path |
| 9 | Aruncă `NotFoundException` dacă camera nu există (`affected=0`) | ❌ Error path |

---

## 4. LightZonesService — `light-zones/light-zones.spec.ts`

### getZone

| # | Test | Tip |
|---|------|-----|
| 1 | Returnează zona dacă există | ✅ Happy path |
| 2 | Aruncă `NotFoundException` dacă zona nu există | ❌ Error path |

### getZones

| # | Test | Tip |
|---|------|-----|
| 3 | Returnează toate zonele când nu se filtrează pe `room_id` | ✅ Happy path |
| 4 | Returnează zonele dintr-o cameră specifică | ✅ Happy path |
| 5 | Aruncă `NotFoundException` dacă camera specificată nu există | ❌ Error path |

### createZone

| # | Test | Tip |
|---|------|-----|
| 6 | Creează zona cu succes | ✅ Happy path |
| 7 | Aruncă `BadRequestException` dacă camera părinte nu există | ❌ Error path |
| 8 | Aruncă `ConflictException` dacă numele zonei există deja în cameră | ❌ Error path |

### updateZone

| # | Test | Tip |
|---|------|-----|
| 9 | Actualizează și returnează zona | ✅ Happy path |
| 10 | Aruncă `NotFoundException` dacă zona nu există | ❌ Error path |

---

## 5. TemperatureProgramsService — `temperature-programs/temperature-programs.spec.ts`

### findAll

| # | Test | Tip |
|---|------|-----|
| 1 | Returnează toate programele ordonate după `id` | ✅ Happy path |

### create

| # | Test | Tip |
|---|------|-----|
| 2 | Creează și returnează un program nou | ✅ Happy path |

### remove

| # | Test | Tip |
|---|------|-----|
| 3 | Șterge programul cu succes | ✅ Happy path |
| 4 | Aruncă `NotFoundException` dacă programul nu există | ❌ Error path |

---

## 6. AuthSessionsService — `auth-sessions/auth-sessions.spec.ts`

### login

| # | Test | Tip |
|---|------|-----|
| 1 | Returnează un token de sesiune la autentificare reușită | ✅ Happy path |
| 2 | Invalidează sesiunile active existente înainte de a crea una nouă | 🔒 Securitate |
| 3 | Aruncă `UnauthorizedException` dacă utilizatorul nu există | ❌ Error path |
| 4 | Aruncă `UnauthorizedException` dacă parola e greșită sau contul e suspendat | ❌ Error path |

---

## 7. HomeSettingsService — `home-settings/home-settings.spec.ts`

### getSettings

| # | Test | Tip |
|---|------|-----|
| 1 | Returnează setările existente dacă rândul există deja | ✅ Happy path |
| 2 | Creează setări implicite dacă nu există niciun rând (auto-seed) | ⚪ Edge case |

### updateSettings

| # | Test | Tip |
|---|------|-----|
| 3 | Actualizează setările existente cu valorile noi | ✅ Happy path |
| 4 | Creează setări noi dacă rândul nu există (comportament upsert) | ⚪ Edge case |

---

## 8. EventsService — `events/events.spec.ts`

### syncEvents

| # | Test | Tip |
|---|------|-----|
| 1 | Mapează DTO-urile în entități, le salvează și returnează numărul sincronizat | ✅ Happy path |
| 2 | Gestionează corect un array gol de evenimente | ⚪ Edge case |

---

## 📊 Rezumat pe tipuri de teste

| Tip | Simbol | Număr |
|-----|--------|-------|
| Happy path (funcționare normală) | ✅ | 26 |
| Error path (excepții așteptate) | ❌ | 19 |
| Edge case (cazuri limită) | ⚪ | 6 |
| Securitate (hash, sesiuni) | 🔒 | 2 |
| **TOTAL** | | **53** |

---

## 🚫 Module fără teste (intenționat)

| Modul | Motiv |
|-------|-------|
| `TemperatureReadingsService` | Clasă goală, fără metode |
| Guards (`SessionGuard`, `AdminSessionGuard`) | Testate indirect prin testele E2E |
| Controllers (individual) | Logica e delegată la service; controllerii sunt thin wrappers |

---

## 📝 Teste E2E (necesită bază de date)

Locație: `test/users/users-flow.e2e-spec.ts`

| # | Test |
|---|------|
| 1 | Returnează 400 Bad Request dacă trimitem un body gol la `/users/register` |
| 2 | Returnează 400 dacă CNP-ul nu are fix 13 caractere |
| 3 | Înregistrează cu succes un user valid, salvează hash-ul și permite login |

```bash
# Rulare teste E2E (necesită PostgreSQL pornit)
npm run test:e2e
```
