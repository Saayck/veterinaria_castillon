@echo off
title Instalador - Sistema Consolidado
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "%~dp0INSTALAR.ps1"
echo.
pause
