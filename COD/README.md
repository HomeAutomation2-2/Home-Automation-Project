# COD

Scripturi utile pentru dezvoltare locala.

## Instalare dependinte (toate proiectele npm)

Ruleaza automat `npm install` in fiecare folder din `COD` care contine `package.json` (excludand `node_modules`).

### Windows - dublu click

```
install-dependencies.bat
```

### Windows / PowerShell

```powershell
cd COD
powershell -ExecutionPolicy Bypass -File .\install-dependencies.ps1
```

### Proiecte detectate in mod obisnuit

- `WEBSERVRS/backend` (NestJS)
- `WEBSERVRS/frontend` (Next.js)
- `SMARTPON` (Svelte / mobile)

Daca adaugi un nou proiect npm sub `COD`, scriptul il va include automat la urmatoarea rulare.
