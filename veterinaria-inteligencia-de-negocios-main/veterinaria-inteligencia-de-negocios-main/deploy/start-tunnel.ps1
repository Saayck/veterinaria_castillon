# ============================================================
# Mantiene vivo el túnel público (localtunnel) con subdominio fijo.
# Si el túnel se cae, lo vuelve a levantar solo. URL estable:
#   https://consolidado-castillon.loca.lt
#
# Uso manual:   powershell -ExecutionPolicy Bypass -File deploy\start-tunnel.ps1
# (o instala la tarea programada con deploy\install-tunnel-task.ps1 para que
#  arranque solo al iniciar sesión).
# ============================================================

$sub = "consolidado-castillon"
$port = 5173

# Lanzar tambien el tunel del 2do frontend (Castillon V2) en segundo plano
$v2script = Join-Path $PSScriptRoot "start-tunnel-v2.ps1"
if (Test-Path $v2script) {
    Start-Process powershell.exe -ArgumentList "-WindowStyle","Hidden","-ExecutionPolicy","Bypass","-File",$v2script -WindowStyle Hidden
}

# Evitar tuneles duplicados DE ESTE subdominio (dos instancias iguales provocan error 503)
$existente = Get-CimInstance Win32_Process -Filter "name='node.exe'" -ErrorAction SilentlyContinue |
             Where-Object { $_.CommandLine -like "*$sub*" }
if ($existente) {
    Write-Host "El tunel YA esta corriendo. Link: https://$sub.loca.lt" -ForegroundColor Green
    Write-Host "(No se inicia otro para no duplicar. Cierra el otro proceso si quieres reiniciarlo.)"
    return
}

Write-Host "Iniciando tunel https://$sub.loca.lt -> localhost:$port  (Ctrl+C para parar)"
while ($true) {
    try {
        npx --yes localtunnel --port $port --subdomain $sub
    } catch {
        Write-Warning "Tunel cayo: $($_.Exception.Message)"
    }
    Write-Host "Reintentando en 3s..."
    Start-Sleep -Seconds 3
}
