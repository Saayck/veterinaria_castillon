# ============================================================
#  ENCENDER TODO — Sistema Consolidado
#  Doble clic en ENCENDER.bat después de reiniciar la PC (o cuando sea).
#  Hace: Docker Desktop -> contenedores -> navegador -> link público.
#  Es idempotente: si algo ya está corriendo, no lo duplica.
# ============================================================

$ErrorActionPreference = "Continue"
$root = $PSScriptRoot
Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "   ENCENDIENDO - Sistema Consolidado" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

# --- 1) Docker Desktop ---
docker info 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "1/4 Iniciando Docker Desktop (espera ~1 minuto)..." -ForegroundColor Yellow
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    $up = $false
    foreach ($i in 1..30) { Start-Sleep -Seconds 5; docker info 2>&1 | Out-Null; if ($LASTEXITCODE -eq 0) { $up = $true; break } }
    if (-not $up) { Write-Host "ERROR: Docker no arranco. Abre Docker Desktop y reintenta." -ForegroundColor Red; return }
} else { Write-Host "1/4 Docker ya estaba encendido." -ForegroundColor Green }

# --- 2) Contenedores (app) ---
Write-Host "2/4 Levantando la aplicacion..." -ForegroundColor Yellow
Push-Location $root
docker compose up -d
Pop-Location

# --- 3) Esperar la app y abrir navegador ---
Write-Host "3/4 Esperando la app..." -ForegroundColor Yellow
$ok = $false
foreach ($i in 1..20) {
    try { $r = Invoke-WebRequest -Uri "http://localhost:5173/" -UseBasicParsing -TimeoutSec 4; if ($r.StatusCode -eq 200) { $ok = $true; break } } catch { Start-Sleep -Seconds 3 }
}
if ($ok) { Start-Process "http://localhost:5173" } else { Write-Host "La app tarda; abre http://localhost:5173 en un momento." -ForegroundColor Yellow }

# --- 4) Link público (túnel) ---
Write-Host "4/4 Link publico..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  Sistema 1 (Veterinaria/Consolidado):" -ForegroundColor Green
Write-Host "    local http://localhost:5173  |  publico https://consolidado-castillon.loca.lt" -ForegroundColor Green
Write-Host "  Sistema 2 (Castillon V2):" -ForegroundColor Green
Write-Host "    local http://localhost:5174  |  publico https://castillonv2-castillon.loca.lt" -ForegroundColor Green
Write-Host "  Usuarios: admin/admin123 | user/admin123 | castillonv2/castillon123" -ForegroundColor Green
Write-Host ""
Write-Host "  (Deja esta ventana ABIERTA para mantener el link publico)" -ForegroundColor Yellow
& "$root\deploy\start-tunnel.ps1"
