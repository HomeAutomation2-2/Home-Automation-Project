# FrontendMinimal

Interfata statica pentru testarea rapida a `BackendV2`.

## Rulare rapida

1. Porneste backendul:

```powershell
cd C:\Users\crisa\Home-Automation-Project\COD\BackendV2
npm run start:dev
```

2. Serveste folderul static cu o extensie de tip Live Server sau cu un server static local. Evita deschiderea directa prin `file://`, deoarece browserul poate bloca requesturile CORS.

3. Server URL implicit:

```text
http://localhost:3500
```

## Conturi utile

Seed default:

```text
0711111111 / test1234
```

Dupa rularea `mock-data.sql`:

```text
0712222222 / alex1234
0713333333 / ana1234
```

## Ce testeaza

- `GET /health`
- `POST /auth-sessions/login`
- `GET /users/me`
- `GET /rooms`
- `GET /light-zones`
- `GET /heating-programs`
- `GET /users/presence`
- `GET /users/logs`
- `POST /embedded/register`
- `POST /embedded/readings/temperature`
- `PATCH /light-zones/:id`
