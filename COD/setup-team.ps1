# Setup local BlueLock — ruleaza din folderul COD
# Usage: powershell -ExecutionPolicy Bypass -File .\setup-team.ps1

$ErrorActionPreference = "Stop"
$CodRoot = $PSScriptRoot
$RepoRoot = Split-Path $CodRoot -Parent

Write-Host "=== BlueLock setup echipa ===" -ForegroundColor Cyan
Write-Host "Repo: $RepoRoot`n"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "EROARE: Docker nu e in PATH. Porneste Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host ">>> 1/4 Dependinte npm..." -ForegroundColor Green
& "$CodRoot\install-dependencies.ps1"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ">>> 2/4 PostgreSQL (Docker, port 5433)..." -ForegroundColor Green
Push-Location "$CodRoot\DATABASES"
docker compose up -d
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    Write-Host "EROARE: docker compose up a esuat. Porneste Docker Desktop." -ForegroundColor Red
    exit 1
}
Pop-Location
Start-Sleep -Seconds 2

Write-Host ">>> 3/4 Scriu backend\.env..." -ForegroundColor Green
$envContent = @"
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=mysecretpassword
DB_DATABASE=home_automation
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5433/home_automation?schema=public"
"@
$envPath = "$CodRoot\WEBSERVRS\backend\.env"
$envContent | Set-Content -Path $envPath -Encoding utf8
Write-Host "OK: $envPath"

Write-Host ">>> 4/4 prisma generate..." -ForegroundColor Green
Push-Location "$CodRoot\WEBSERVRS\backend"
npm run prisma:generate
if ($LASTEXITCODE -ne 0) { Pop-Location; exit $LASTEXITCODE }
Pop-Location

Write-Host "`n=== Gata setup automat ===" -ForegroundColor Green
Write-Host "Acum deschide 2 terminale:" -ForegroundColor Yellow
Write-Host "  T1: cd `"$CodRoot\WEBSERVRS\backend`"  ->  npm run start:dev"
Write-Host "  T2: cd `"$CodRoot\SMARTPON`"         ->  npm run dev"
Write-Host "`nIn app mobil, server URL: http://localhost:3000"
Write-Host "Test API: curl.exe http://localhost:3000/health"
Write-Host "DBeaver: localhost:5433, db home_automation, user postgres / mysecretpassword`n"
