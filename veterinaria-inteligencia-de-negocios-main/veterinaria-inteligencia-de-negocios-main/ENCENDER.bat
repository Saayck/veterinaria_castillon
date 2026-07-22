@echo off
title Encender - Sistema Consolidado
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "%~dp0ENCENDER.ps1"
echo.
pause
