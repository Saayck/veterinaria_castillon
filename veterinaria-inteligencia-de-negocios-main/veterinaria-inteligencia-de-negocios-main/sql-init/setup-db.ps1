# ============================================================
# Runner de inicializacion de las 3 BDs desde los dumps reales.
# Ejecuta, EN ORDEN:
#   1) 00-crear-databases.sql          -> crea las 3 bases vacias
#   2) BD_CASTILLON_VETERINARIA.sql    -> dump fuente veterinaria
#   3) CASTILLONV2.sql                 -> dump fuente restaurante/comercial
#   4) BD_CONSOLIDADO.sql              -> dump base central (2 tablas)
#   5) migracion-dump.sql              -> agrega VERSION/OUTBOX/USUARIO al consolidado
#
# NO ejecuta init.sql: ese script es la ruta alternativa "demo sin dumps"
# y sus CREATE TABLE chocarian con los dumps.
#
# Uso (desde la carpeta sql-init):
#   .\setup-db.ps1 -Server "localhost,64419" -User sa -Password "TuPassword"
#   .\setup-db.ps1 -Server "localhost\SQL2022" -User sa -Password "TuPassword"
# Requiere sqlcmd en el PATH.
# ============================================================

param(
    [Parameter(Mandatory = $true)][string]$Server,
    [string]$User = "sa",
    [Parameter(Mandatory = $true)][string]$Password
)

$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path

$scripts = @(
    "00-crear-databases.sql",
    "BD_CASTILLON_VETERINARIA.sql",
    "CASTILLONV2.sql",
    "BD_CONSOLIDADO.sql",
    "migracion-dump.sql"
)

foreach ($script in $scripts) {
    $path = Join-Path $here $script
    if (-not (Test-Path $path)) {
        throw "No se encontro el script requerido: $path"
    }
    Write-Host "==> Ejecutando $script ..." -ForegroundColor Cyan
    sqlcmd -S $Server -U $User -P $Password -b -i $path
    if ($LASTEXITCODE -ne 0) {
        throw "Fallo la ejecucion de $script (exit $LASTEXITCODE)"
    }
}

Write-Host "OK: las 3 bases quedaron inicializadas y migradas." -ForegroundColor Green
