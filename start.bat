@echo off
echo === WarmTracker ===
echo Iniciando servidor...
echo.
cd /d "%~dp0"
node node_modules/next/dist/bin/next dev
