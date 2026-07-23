# ============================================================
# Tunel publico del 2do frontend: Sistema Castillon V2.
#   https://castillonv2-castillon.loca.lt -> localhost:5174
# Se lanza automaticamente desde start-tunnel.ps1 (o manual).
# ============================================================

$sub = "castillonv2-castillon"
$port = 5174

# Evitar duplicados de ESTE subdominio
$existente = Get-CimInstance Win32_Process -Filter "name='node.exe'" -ErrorAction SilentlyContinue |
             Where-Object { $_.CommandLine -like "*$sub*" }
if ($existente) {
    Write-Host "El tunel V2 ya esta corriendo: https://$sub.loca.lt" -ForegroundColor Green
    return
}

Write-Host "Iniciando tunel https://$sub.loca.lt -> localhost:$port"
while ($true) {
    try {
        npx --yes localtunnel --port $port --subdomain $sub
    } catch {
        Write-Warning "Tunel V2 cayo: $($_.Exception.Message)"
    }
    Start-Sleep -Seconds 3
}
