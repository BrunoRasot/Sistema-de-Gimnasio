$ErrorActionPreference = 'Stop'

$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = [Security.Principal.WindowsPrincipal]::new($identity)
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  throw 'Abre PowerShell con "Ejecutar como administrador" y vuelve a ejecutar este script.'
}

$socket = Join-Path $env:LOCALAPPDATA 'Docker\run\dockerInference'
if (-not $socket.StartsWith((Join-Path $env:LOCALAPPDATA 'Docker\run'), [StringComparison]::OrdinalIgnoreCase)) {
  throw 'La ruta del socket no es segura.'
}

Get-Process -Name 'Docker Desktop', 'com.docker.backend', 'docker-desktop' -ErrorAction SilentlyContinue |
  Stop-Process -Force

if (Test-Path -LiteralPath $socket) {
  $item = Get-Item -LiteralPath $socket -Force
  if ($item.PSIsContainer -or $item.Length -ne 0 -or -not ($item.Attributes -band [IO.FileAttributes]::ReparsePoint)) {
    throw 'El objeto encontrado no coincide con el socket temporal esperado; no se eliminó.'
  }

  & takeown.exe /F $socket | Out-Null
  & icacls.exe $socket /grant "${env:USERNAME}:F" | Out-Null
  & fsutil.exe reparsepoint delete $socket | Out-Null
  Remove-Item -LiteralPath $socket -Force
}

Start-Process -FilePath 'C:\Program Files\Docker\Docker\Docker Desktop.exe'
Write-Host 'Socket reparado. Espera a que Docker Desktop muestre "Engine running" y ejecuta el despliegue.'
