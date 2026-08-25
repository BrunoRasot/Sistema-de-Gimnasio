param(
  [Parameter(Mandatory = $true)]
  [string]$BackupFile,
  [switch]$ConfirmRestore,
  [string]$EnvFile = '.env.production'
)

$ErrorActionPreference = 'Stop'
if (-not $ConfirmRestore) {
  throw 'La restauración reemplaza los datos actuales. Repite con -ConfirmRestore.'
}

$workspace = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$resolvedBackup = [System.IO.Path]::GetFullPath($BackupFile)
if (-not $resolvedBackup.StartsWith($workspace, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw 'El backup debe estar dentro del workspace.'
}
if (-not (Test-Path -LiteralPath $resolvedBackup -PathType Leaf)) {
  throw "No existe el backup: $resolvedBackup"
}

$checksumFile = "$resolvedBackup.sha256"
if (-not (Test-Path -LiteralPath $checksumFile -PathType Leaf)) {
  throw "Falta el archivo de integridad: $checksumFile"
}
$expectedHash = ((Get-Content -LiteralPath $checksumFile -Raw).Trim() -split '\s+')[0]
$actualHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $resolvedBackup).Hash
if ($actualHash -ne $expectedHash) {
  throw 'El SHA256 del backup no coincide. Se canceló la restauración.'
}

$containerId = (docker compose --env-file $EnvFile ps -q database).Trim()
if (-not $containerId) {
  throw 'El contenedor de PostgreSQL no está en ejecución.'
}

$containerFile = '/tmp/restore.dump'
$servicesStopped = $false
try {
  docker compose --env-file $EnvFile stop frontend backend
  if ($LASTEXITCODE -ne 0) { throw 'No se pudieron detener los servicios de aplicación.' }
  $servicesStopped = $true

  docker cp $resolvedBackup "${containerId}:$containerFile"
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo copiar el backup al contenedor.' }

  docker compose --env-file $EnvFile exec -T database sh -c "pg_restore --username=`"`$POSTGRES_USER`" --dbname=`"`$POSTGRES_DB`" --clean --if-exists --no-owner --no-privileges $containerFile"
  if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL no pudo restaurar el backup.' }

  docker compose --env-file $EnvFile run --rm migrate
  if ($LASTEXITCODE -ne 0) { throw 'Las migraciones posteriores a la restauración fallaron.' }

  Write-Host 'Restauración finalizada correctamente.'
}
finally {
  docker compose --env-file $EnvFile exec -T database rm -f $containerFile 2>$null
  if ($servicesStopped) {
    docker compose --env-file $EnvFile start backend frontend
  }
}
