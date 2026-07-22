# ============================================================
#  INSTALADOR DE UN CLIC — Sistema Consolidado
#  Restaura las 5 bases, crea .env, levanta la app y abre el navegador.
#  Se ejecuta desde INSTALAR.bat (doble clic).
# ============================================================

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "   INSTALADOR - Sistema Consolidado (BI)" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# --- Verificaciones ---
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Docker no esta instalado. Instala 'Docker Desktop' y vuelve a intentar." -ForegroundColor Red
    return
}
$sqlcmd = Get-Command sqlcmd -ErrorAction SilentlyContinue
if (-not $sqlcmd) {
    Write-Host "ERROR: 'sqlcmd' no esta instalado (viene con SQL Server o con las 'SQL Server Command Line Utilities')." -ForegroundColor Red
    return
}

# --- 1) Contrasena de SQL Server ---
Write-Host "Paso 1/4 - Base de datos" -ForegroundColor Yellow
$pass = Read-Host "  Contrasena de tu SQL Server (usuario sa) [Enter = Castillon@2025]"
if ([string]::IsNullOrWhiteSpace($pass)) { $pass = "Castillon@2025" }

Write-Host "  Restaurando las 5 bases de datos..." -ForegroundColor Gray
& "$root\sql-init\setup-db.ps1" -Server "localhost,1433" -User sa -Password $pass
Write-Host "  Bases listas." -ForegroundColor Green

# --- 2) Archivo .env ---
Write-Host "Paso 2/4 - Configuracion (.env)" -ForegroundColor Yellow
$envFile = Join-Path $root ".env"
$lines = @(
    "SQLSERVER_HOST=host.docker.internal",
    "SQLSERVER_PORT=1433",
    "SQLSERVER_USERNAME=sa",
    "SQLSERVER_PASSWORD=$pass",
    "JWT_SECRET=Consolidado2025SecretKeyQueDebeSerLargaParaHMACSHA256!",
    "JWT_EXPIRATION=86400000",
    "CORS_ALLOWED_ORIGINS=*"
)
Set-Content -Path $envFile -Value $lines -Encoding ascii
Write-Host "  .env creado." -ForegroundColor Green

# --- 3) Levantar la app con Docker ---
Write-Host "Paso 3/4 - Levantando la aplicacion (puede tardar unos minutos la primera vez)..." -ForegroundColor Yellow
Push-Location $root
docker compose up -d --build
Pop-Location

# --- 4) Esperar a que responda y abrir el navegador ---
Write-Host "Paso 4/4 - Esperando a que la app este lista..." -ForegroundColor Yellow
$ok = $false
foreach ($i in 1..30) {
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:5173/" -UseBasicParsing -TimeoutSec 5
        if ($r.StatusCode -eq 200) { $ok = $true; break }
    } catch { Start-Sleep -Seconds 4 }
}

Write-Host ""
if ($ok) {
    Write-Host "==============================================" -ForegroundColor Green
    Write-Host "   LISTO. Abriendo http://localhost:5173" -ForegroundColor Green
    Write-Host "   Usuario: admin    Contrasena: admin123" -ForegroundColor Green
    Write-Host "==============================================" -ForegroundColor Green
    Start-Process "http://localhost:5173"
} else {
    Write-Host "La app tardo mas de lo normal. Abre manualmente: http://localhost:5173" -ForegroundColor Yellow
    Write-Host "Si no carga, revisa que Docker Desktop este abierto." -ForegroundColor Yellow
}
