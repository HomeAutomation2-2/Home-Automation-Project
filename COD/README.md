# COD — Setup local (paste & run)

Ghid pentru echipa dupa `git pull` pe branch-ul de snapshot.

**Branch de lucru:** `integration/team-snapshot-2026-05-08`

**Cerinte:** Node.js 20+, Docker Desktop (pornit), Git, PowerShell.

---

## Quick start (un singur script)

Dupa pull, din folderul `COD`:

```powershell
cd C:\Users\<USER>\Home-Automation-Project\COD
powershell -ExecutionPolicy Bypass -File .\setup-team.ps1
```

Apoi doar 2 terminale:

```powershell
# Terminal 1 — API
cd C:\Users\<USER>\Home-Automation-Project\COD\WEBSERVRS\backend
npm run start:dev

# Terminal 2 — Mobile UI
cd C:\Users\<USER>\Home-Automation-Project\COD\SMARTPON
npm run dev
```

In app: server = `http://localhost:3000`

---

## 0) Clone / pull snapshot

```powershell
cd C:\Users\<USER>\Home-Automation-Project
git fetch --all
git checkout integration/team-snapshot-2026-05-08
git pull origin integration/team-snapshot-2026-05-08
```

---

## 1) Instalare dependinte npm (backend + mobile + frontend)

```powershell
cd C:\Users\<USER>\Home-Automation-Project\COD
powershell -ExecutionPolicy Bypass -File .\install-dependencies.ps1
```

Inlocuieste `<USER>` cu userul tau Windows. Sau dublu-click: `COD\install-dependencies.bat`

---

## 2) Pornire PostgreSQL (Docker, port 5433)

```powershell
cd C:\Users\<USER>\Home-Automation-Project\COD\DATABASES
docker compose up -d
docker ps
```

Trebuie sa vezi containerul `home_automation_db` cu `0.0.0.0:5433->5432/tcp`.

**Nota:** folosim port **5433** ca sa nu se confunde cu Postgres local de pe 5432.

---

## 3) Creare `.env` backend (copy-paste)

```powershell
cd C:\Users\<USER>\Home-Automation-Project\COD\WEBSERVRS\backend
@'
PORT=3500
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=mysecretpassword
DB_DATABASE=home_automation
'@ | Set-Content -Path .env -Encoding utf8
```

---

## 4) Pornire backend

**Terminal 1** (lasa-l deschis):

```powershell
cd C:\Users\<USER>\Home-Automation-Project\COD\WEBSERVRS\backend
npm run start:dev
```

Test in alt terminal:

```powershell
curl.exe http://localhost:3000/health
```

Raspuns asteptat: `{"status":"ok","name":"Dev Bluelock v0.0"}`

---

## 5) Pornire aplicatie mobila (SMARTPON)

**Terminal 2** (lasa-l deschis):

```powershell
cd C:\Users\<USER>\Home-Automation-Project\COD\SMARTPON
npm run dev
```

Deschide in browser: `http://localhost:5173`

La **Select server** introdu:

```text
http://localhost:3000
```

**NU** `http://localhost:5173` (5173 = doar UI, nu API).

### Telefon / emulator Android

| Mediu | URL server in app |
|-------|-------------------|
| Emulator Android | `http://10.0.2.2:3000` |
| Telefon in aceeasi retea Wi-Fi | `http://<IP-PC>:3000` |

Afla IP-ul PC:

```powershell
ipconfig
```

(cauta `IPv4 Address` pe Wi-Fi)

---

## 6) (Optional) Frontend web

**Terminal 3** — Next pe 3001 ca sa nu calce backend-ul (3000):

```powershell
cd C:\Users\<USER>\Home-Automation-Project\COD\WEBSERVRS\frontend
npm run dev -- -p 3001
```

Browser: `http://localhost:3001` (template Next.js, nu dashboard complet inca).

---

## 7) DBeaver — conectare DB

| Camp | Valoare |
|------|---------|
| Host | `localhost` |
| Port | **`5433`** |
| Database | `home_automation` |
| Username | `postgres` |
| Password | `mysecretpassword` |

Vezi date: `Schemas → public → Tables → users` → View Data.

### Sau din terminal (psql)

```powershell
docker exec -it home_automation_db psql -U postgres -d home_automation
```

```sql
\dt
SELECT * FROM users;
\q
```

---

## 8) Creare cont test (API)

Schimba `cnp` / `phone` daca primesti eroare 409 (deja exista).

```powershell
$body = @{
  firstName = "Test"
  lastName = "User"
  cnp = "1990101123457"
  phone = "0711111111"
  password_plaintext = "test1234"
  isAdmin = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/users/register" `
  -Method POST -ContentType "application/json" -Body $body
```

Login:

```powershell
$login = @{
  phone = "0711111111"
  password_plaintext = "test1234"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/users/login" `
  -Method POST -ContentType "application/json" -Body $login
```

Apoi in app mobil: login cu acelasi telefon + parola.

---

## Ordinea terminalelor (rezumat)

| Terminal | Comanda | URL |
|----------|---------|-----|
| 1 | `docker compose up -d` in `COD\DATABASES` | DB pe 5433 |
| 2 | `npm run start:dev` in `COD\WEBSERVRS\backend` | API `http://localhost:3000` |
| 3 | `npm run dev` in `COD\SMARTPON` | UI `http://localhost:5173` |

---

## Probleme frecvente

| Eroare | Solutie |
|--------|---------|
| `dockerDesktopLinuxEngine` not found | Porneste **Docker Desktop** si asteapta „running” |
| `database "home_automation" does not exist` pe 5432 | DBeaver/backend trebuie pe port **5433**, nu 5432 |
| `ECONNREFUSED` la backend | `docker compose up -d` + verifica `DB_PORT=5433` in `.env` |
| Mobile `[404] GET /rooms` | Server in app = `http://localhost:3000` |
| `npm test` OK dar `start:dev` pica | Testele nu necesita DB live; runtime da |
| `EACCES` pe port **3000** | Windows rezerva 2936–3035 (Hyper-V/Docker). In `.env`: `PORT=3500`, apoi in app mobil `http://localhost:3500` |

---

## Ce folosim acum (DB)

- **Schema activa:** `COD/DATABASES/init-scripts/01-schema.sql` (simpla, 10 tabele)
- **Backend:** TypeORM (`synchronize: false` — schema din SQL la primul start Docker)
- **Date locale Docker:** `COD/DATABASES/.pgdata/` (ignorat de Git, bind mount Postgres)

---

## Ce NU e in snapshot

- Embedded (`ARDUINOU`, `SENZWIRES`) — doar foldere placeholder
- Acces usa BLE real / relee / senzori — nu merge fara hardware
- Web dashboard complet — frontend e scaffold Next

---

## Scripturi utile in `COD/`

| Fisier | Rol |
|--------|-----|
| `setup-team.ps1` / `.bat` | Setup complet: deps + Docker + `.env` |
| `install-dependencies.ps1` / `.bat` | Doar `npm install` in toate proiectele npm |
| `DATABASES/docker-compose.yaml` | Postgres Docker |
| `WEBSERVRS/backend/.env.example` | Template env (vezi sectiunea 3 pentru valorile corecte) |
