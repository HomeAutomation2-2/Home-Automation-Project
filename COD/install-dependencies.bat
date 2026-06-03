@echo off
setlocal
cd /d "%~dp0"

echo Pornesc instalarea dependintelor din COD...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-dependencies.ps1"
set EXITCODE=%ERRORLEVEL%

echo.
if %EXITCODE% NEQ 0 (
    echo Instalare finalizata cu erori. Cod iesire: %EXITCODE%
    pause
    exit /b %EXITCODE%
)

echo Instalare finalizata cu succes.
pause
exit /b 0
