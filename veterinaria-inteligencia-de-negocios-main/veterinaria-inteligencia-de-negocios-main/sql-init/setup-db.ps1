# ============================================================
# Inicializa las 5 bases de datos del Sistema Consolidado.
#
#   3 desde dumps .sql : BD_CASTILLON_VETERINARIA, CASTILLONV2, BD_CONSOLIDADO
#   2 desde backups .bak: SamarImportadora, DW_SamarImportadora
#   + migracion-dump.sql (VERSION/OUTBOX/USUARIO/CONFIGURACION)
#
# Idempotente: si una base ya existe se OMITE (no falla). Usa -Fresh para
# borrarlas y recargarlas desde cero.
#
# Uso:
#   .\setup-db.ps1 -Server "localhost,1433" -User sa -Password "Castillon@2025"
#   .\setup-db.ps1 -Server "localhost,1433" -User sa -Password "..." -Fresh
# Requiere sqlcmd en el PATH.
# ============================================================

param(
    [Parameter(Mandatory = $true)][string]$Server,
    [string]$User = "sa",
    [Parameter(Mandatory = $true)][string]$Password,
    [switch]$Fresh
)

$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
# Carpeta legible por la cuenta de servicio de SQL Server (Downloads/Documents suele dar Acceso denegado)
$bakShared = "C:\Users\Public\sqlbak"

function Invoke-Sql([string]$query) {
    sqlcmd -S $Server -U $User -P $Password -C -b -h -1 -W -Q $query
    if ($LASTEXITCODE -ne 0) { throw "Fallo SQL: $query" }
}
function Invoke-SqlFile([string]$path) {
    sqlcmd -S $Server -U $User -P $Password -C -f 65001 -b -i $path
    if ($LASTEXITCODE -ne 0) { throw "Fallo ejecutando $path" }
}
function Test-DbExists([string]$db) {
    $out = sqlcmd -S $Server -U $User -P $Password -C -h -1 -W -Q "SET NOCOUNT ON; SELECT CASE WHEN DB_ID('$db') IS NULL THEN 0 ELSE 1 END;"
    return ($out -match '1')
}
function Remove-Db([string]$db) {
    Invoke-Sql "IF DB_ID('$db') IS NOT NULL BEGIN ALTER DATABASE [$db] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [$db]; END"
}

# Ruta de datos por defecto de la instancia (para el MOVE de los .bak)
$dataPath = (sqlcmd -S $Server -U $User -P $Password -C -h -1 -W -Q "SET NOCOUNT ON; SELECT CONVERT(NVARCHAR(400), SERVERPROPERTY('InstanceDefaultDataPath'));").Trim()

# ---- 1) Bases desde dumps .sql ----
$dumps = @(
    @{ Db = "BD_CASTILLON_VETERINARIA"; File = "BD_CASTILLON_VETERINARIA.sql" },
    @{ Db = "CASTILLONV2";              File = "CASTILLONV2.sql" },
    @{ Db = "BD_CONSOLIDADO";           File = "BD_CONSOLIDADO.sql" }
)
foreach ($d in $dumps) {
    if ((Test-DbExists $d.Db) -and $Fresh) { Write-Host "Borrando $($d.Db)..." -ForegroundColor Yellow; Remove-Db $d.Db }
    if (Test-DbExists $d.Db) { Write-Host "== $($d.Db): ya existe, se omite" -ForegroundColor DarkGray; continue }
    Write-Host "== $($d.Db): creando y cargando dump" -ForegroundColor Cyan
    Invoke-Sql "CREATE DATABASE [$($d.Db)];"
    Invoke-SqlFile (Join-Path $here $d.File)
}

# ---- 2) Bases desde backups .bak ----
$baks = @(
    @{ Db = "SamarImportadora";     File = "SamarImportadora.bak";     Logical = "SamarImportadora" },
    @{ Db = "DW_SamarImportadora";  File = "DW_SamarImportadora.bak";  Logical = "DW_SamarImportadora" }
)
New-Item -ItemType Directory -Path $bakShared -Force | Out-Null
foreach ($b in $baks) {
    if ((Test-DbExists $b.Db) -and $Fresh) { Write-Host "Borrando $($b.Db)..." -ForegroundColor Yellow; Remove-Db $b.Db }
    if (Test-DbExists $b.Db) { Write-Host "== $($b.Db): ya existe, se omite" -ForegroundColor DarkGray; continue }

    $src = Join-Path $here "backups\$($b.File)"
    if (-not (Test-Path $src)) { throw "No se encontro el backup: $src (copialo a sql-init\backups\)" }
    $shared = Join-Path $bakShared $b.File
    Copy-Item $src $shared -Force   # a carpeta legible por el servicio SQL

    Write-Host "== $($b.Db): restaurando desde .bak" -ForegroundColor Cyan
    $mdf = Join-Path $dataPath "$($b.Db).mdf"
    $ldf = Join-Path $dataPath "$($b.Db)_log.ldf"
    Invoke-Sql ("RESTORE DATABASE [$($b.Db)] FROM DISK = N'$shared' WITH " +
                "MOVE '$($b.Logical)' TO N'$mdf', MOVE '$($b.Logical)_log' TO N'$ldf', REPLACE, RECOVERY;")
}

# ---- 3) Migracion (idempotente) sobre BD_CONSOLIDADO ----
Write-Host "== Migracion (VERSION/OUTBOX/USUARIO/CONFIGURACION)" -ForegroundColor Cyan
Invoke-SqlFile (Join-Path $here "migracion-dump.sql")

Write-Host "OK: las 5 bases quedaron listas." -ForegroundColor Green
