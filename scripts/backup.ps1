param(
  [string]$Destination = (Join-Path $PSScriptRoot '..\backups'),
  [string]$EnvFile = '.env.production'
)

$ErrorActionPreference = 'Stop'
$workspace = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$backupDirectory = [System.IO.Path]::GetFullPath($Destination)

if (-not $backupDirectory.StartsWith($workspace, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw 'El directorio de backup debe permanecer dentro del workspace.'
}

New-Item -ItemType Directory -Force -Path $backupDirectory | Out-Null
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$filename = "sistema-gimnasio-$timestamp.dump"
$localFile = Join-Path $backupDirectory $filename
$containerFile = "/tmp/$filename"
$containerId = (docker compose --env-file $EnvFile ps -q database).Trim()

if (-not $containerId) {
  throw 'El contenedor de PostgreSQL no está en ejecución.'
}

try {
  docker compose --env-file $EnvFile exec -T database sh -c "pg_dump --username=`"`$POSTGRES_USER`" --dbname=`"`$POSTGRES_DB`" --format=custom --file=$containerFile"
  if ($LASTEXITCODE -ne 0) { throw 'pg_dump no pudo generar el backup.' }

  docker cp "${containerId}:$containerFile" $localFile
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo copiar el backup al host.' }

  $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $localFile).Hash
  Set-Content -LiteralPath "$localFile.sha256" -Value "$hash  $filename"
  Write-Host "Backup creado: $localFile"
  Write-Host "SHA256: $hash"
}
finally {
  docker compose --env-file $EnvFile exec -T database rm -f $containerFile 2>$null
}
