@echo off
title Iniciar app - Sistema Consolidado
cd /d "%~dp0"
echo Iniciando la aplicacion...
docker compose up -d
timeout /t 8 /nobreak >nul
start "" http://localhost:5173
echo App en http://localhost:5173  (admin / admin123)
pause
