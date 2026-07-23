# ============================================================
# Mantiene vivos los 2 tuneles publicos (localtunnel) con subdominio fijo:
#   https://consolidado-castillon.loca.lt  -> localhost:5173  (Veterinaria/Consolidado)
#   https://castillonv2-castillon.loca.lt  -> localhost:5174  (Castillon V2)
#
# WATCHDOG: cada pocos segundos verifica por HTTP que cada tunel responda.
# Si detecta 503 (el server de localtunnel "perdio" el tunel) o el proceso
# murio, MATA el arbol de ese subdominio y lo vuelve a levantar. Asi ningun
# link se queda caido aunque el otro siga bien.
#
# Uso:  powershell -ExecutionPolicy Bypass -File deploy\start-tunnel.ps1
#       (deja esta ventana abierta). Tambien lo lanza la tarea programada.
# ============================================================

$tuneles = @(
    @{ sub = "consolidado-castillon"; port = 5173 },
    @{ sub = "castillonv2-castillon"; port = 5174 }
)

# Mata TODO proceso node cuya linea de comando contenga el subdominio
# (mata el wrapper npx y el hijo lt.js, evitando zombies que retienen el subdominio).
function Stop-Lt([string]$sub) {
    Get-CimInstance Win32_Process -Filter "name='node.exe'" -ErrorAction SilentlyContinue |
        Where-Object { $_.CommandLine -like "*$sub*" } |
        ForEach-Object { try { Stop-Process -Id $_.ProcessId -Force -ErrorAction Stop } catch {} }
}

# Lanza un tunel en segundo plano (ventana oculta). Devuelve el objeto Process.
function Start-Lt([string]$sub, [int]$port) {
    Stop-Lt $sub
    Start-Sleep -Seconds 1
    return Start-Process -FilePath "npx.cmd" `
        -ArgumentList "--yes","localtunnel","--port","$port","--subdomain","$sub" `
        -WindowStyle Hidden -PassThru
}

# Verdadero si el tunel responde vivo. 503 = el server perdio el tunel (hay que reiniciar).
function Test-Lt([string]$sub) {
    try {
        $r = Invoke-WebRequest -Uri "https://$sub.loca.lt/" `
             -Headers @{ "bypass-tunnel-reminder" = "1"; "User-Agent" = "watchdog" } `
             -UseBasicParsing -TimeoutSec 12
        return $true  # 200 u otra respuesta del app => tunel vivo
    } catch {
        $code = $null
        try { $code = [int]$_.Exception.Response.StatusCode } catch {}
        # 502 = el tunel esta vivo pero el contenedor local no responde (no reiniciar el tunel).
        if ($code -eq 502) { return $true }
        return $false # 503 o error de conexion => tunel caido
    }
}

Write-Host "Levantando tuneles..." -ForegroundColor Cyan
foreach ($t in $tuneles) {
    Start-Lt $t.sub $t.port | Out-Null
    Write-Host "  https://$($t.sub).loca.lt  ->  localhost:$($t.port)" -ForegroundColor Green
}
Write-Host ""
Write-Host "Watchdog activo. Deja esta ventana ABIERTA. (Ctrl+C para parar)" -ForegroundColor Yellow
Write-Host ""

# Da tiempo al primer arranque antes de empezar a vigilar.
Start-Sleep -Seconds 20

$fallos = @{}
foreach ($t in $tuneles) { $fallos[$t.sub] = 0 }

while ($true) {
    foreach ($t in $tuneles) {
        $vivo = Test-Lt $t.sub
        if ($vivo) {
            if ($fallos[$t.sub] -gt 0) {
                Write-Host ("[{0}] {1} OK de nuevo." -f (Get-Date -Format HH:mm:ss), $t.sub) -ForegroundColor Green
            }
            $fallos[$t.sub] = 0
        } else {
            $fallos[$t.sub]++
            Write-Host ("[{0}] {1} no responde ({2}). " -f (Get-Date -Format HH:mm:ss), $t.sub, $fallos[$t.sub]) -ForegroundColor Yellow -NoNewline
            # 2 fallos seguidos => reiniciar ese tunel (matar arbol + relanzar).
            if ($fallos[$t.sub] -ge 2) {
                Write-Host "Reiniciando tunel..." -ForegroundColor Red
                Start-Lt $t.sub $t.port | Out-Null
                $fallos[$t.sub] = 0
                Start-Sleep -Seconds 15  # dar tiempo a reclamar el subdominio
            } else {
                Write-Host ""
            }
        }
    }
    Start-Sleep -Seconds 12
}
