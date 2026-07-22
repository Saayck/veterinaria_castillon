# ============================================================
# Registra una Tarea Programada que arranca el túnel al iniciar sesión,
# para que el link público sobreviva reinicios (dure toda la semana).
# Ejecutar UNA vez:
#   powershell -ExecutionPolicy Bypass -File deploy\install-tunnel-task.ps1
# Para quitarla:  Unregister-ScheduledTask -TaskName "ConsolidadoTunnel" -Confirm:$false
# ============================================================

$here   = Split-Path -Parent $MyInvocation.MyCommand.Path
$script = Join-Path $here "start-tunnel.ps1"
$name   = "ConsolidadoTunnel"

$action  = New-ScheduledTaskAction -Execute "powershell.exe" `
           -Argument "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$script`""
$trigger = New-ScheduledTaskTrigger -AtLogOn
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
            -StartWhenAvailable -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1)

Register-ScheduledTask -TaskName $name -Action $action -Trigger $trigger -Settings $settings -Force | Out-Null
Write-Host "Tarea '$name' registrada: el tunel arrancara solo al iniciar sesion." -ForegroundColor Green
