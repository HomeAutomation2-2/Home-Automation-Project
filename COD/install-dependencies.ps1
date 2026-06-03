# Instaleaza dependintele npm pentru toate proiectele din COD care au package.json.
# Utilizare:
#   powershell -ExecutionPolicy Bypass -File .\install-dependencies.ps1
# Sau dublu-click pe install-dependencies.bat

$ErrorActionPreference = "Stop"
$CodRoot = $PSScriptRoot

function Test-CommandExists {
    param([string]$Name)
    return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Get-NpmProjectRoots {
    param([string]$Root)
    $excludeDirPattern = "(\\|/)(node_modules|\.next|dist|build|coverage)(\\|/)"
    Get-ChildItem -Path $Root -Filter "package.json" -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -notmatch $excludeDirPattern } |
        ForEach-Object { $_.Directory.FullName } |
        Sort-Object -Unique
}

Write-Host "=== BlueLock / COD - instalare dependinte ===" -ForegroundColor Cyan
Write-Host "Radacina: $CodRoot`n"

if (-not (Test-CommandExists "node")) {
    Write-Host "EROARE: Node.js nu este instalat sau nu este in PATH." -ForegroundColor Red
    Write-Host "Instaleaza Node.js 20+ de la https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-CommandExists "npm")) {
    Write-Host "EROARE: npm nu este disponibil in PATH." -ForegroundColor Red
    exit 1
}

Write-Host "Node: $(node -v)"
Write-Host "npm:  $(npm -v)`n"

$projects = Get-NpmProjectRoots -Root $CodRoot

if ($projects.Count -eq 0) {
    Write-Host "Nu s-a gasit niciun package.json sub COD." -ForegroundColor Yellow
    exit 0
}

Write-Host "Proiecte gasite ($($projects.Count)):"
foreach ($p in $projects) {
    $relative = $p.Substring($CodRoot.Length).TrimStart("\", "/")
    if ([string]::IsNullOrWhiteSpace($relative)) { $relative = "." }
    Write-Host "  - $relative"
}
Write-Host ""

$failed = @()

foreach ($projectPath in $projects) {
    $label = $projectPath.Substring($CodRoot.Length).TrimStart("\", "/")
    if ([string]::IsNullOrWhiteSpace($label)) { $label = "." }

    Write-Host ">>> npm install in: $label" -ForegroundColor Green
    Push-Location $projectPath
    try {
        npm install
        if ($LASTEXITCODE -ne 0) {
            throw "npm install a esuat cu codul $LASTEXITCODE"
        }
        Write-Host "OK: $label`n" -ForegroundColor DarkGreen
    }
    catch {
        Write-Host "ESUAT: $label - $_`n" -ForegroundColor Red
        $failed += $label
    }
    finally {
        Pop-Location
    }
}

Write-Host "=== Rezumat ===" -ForegroundColor Cyan
if ($failed.Count -eq 0) {
    Write-Host "Toate dependintele au fost instalate cu succes." -ForegroundColor Green
    exit 0
}

Write-Host "Proiecte cu erori:" -ForegroundColor Red
foreach ($f in $failed) {
    Write-Host "  - $f"
}
exit 1
