param([int]$MaximumBackupAgeHours = 26)

$ErrorActionPreference = 'Stop'
$workspace = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$envFile = Join-Path $workspace '.env.production'
$composeArgs = @(
  'compose', '--env-file', $envFile,
  '-f', (Join-Path $workspace 'compose.yaml'),
  '-f', (Join-Path $workspace 'compose.production.yaml'),
  '-f', (Join-Path $workspace 'compose.local-tls.yaml')
)

$required = @('database', 'backend', 'frontend', 'gateway')
foreach ($service in $required) {
  $containerId = (& docker @composeArgs ps -q $service).Trim()
  if (-not $containerId) { throw "Servicio no iniciado: $service" }
  $state = (docker inspect --format '{{.State.Status}}' $containerId).Trim()
  if ($state -ne 'running') { throw "Servicio no operativo: $service ($state)" }
}

$apiStatus = curl.exe -k --silent --show-error --output NUL --write-out '%{http_code}' https://localhost/api/health/ready
if ($apiStatus -ne '200') { throw "API no saludable: HTTP $apiStatus" }

$latestBackup = Get-ChildItem -LiteralPath (Join-Path $workspace 'backups') -Filter 'sistema-gimnasio-*.dump' -File |
  Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $latestBackup) { throw 'No existe un backup productivo.' }
$age = (Get-Date) - $latestBackup.LastWriteTime
if ($age.TotalHours -gt $MaximumBackupAgeHours) { throw "El último backup tiene $([math]::Round($age.TotalHours, 1)) horas." }

$drive = Get-PSDrive -Name ([System.IO.Path]::GetPathRoot($workspace).TrimEnd(':\'))
if ($drive.Free -lt 5GB) { throw "Espacio libre crítico: $([math]::Round($drive.Free / 1GB, 1)) GB." }
Write-Host "Producción saludable. API 200, backup reciente y $([math]::Round($drive.Free / 1GB, 1)) GB libres."
