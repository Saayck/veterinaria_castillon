@echo off
title Publicar link publico - Sistema Consolidado
cd /d "%~dp0"
echo Generando el link publico (deja esta ventana ABIERTA)...
echo Link: https://consolidado-castillon.loca.lt
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0deploy\start-tunnel.ps1"
pause
