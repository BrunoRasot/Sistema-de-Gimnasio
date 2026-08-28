param(
  [string]$Destination = (Join-Path $PSScriptRoot '..\backups'),
  [string]$EnvFile = '.env.production',
  [ValidateRange(1, 3650)]
  [int]$RetentionDays = 30
)

$ErrorActionPreference = 'Stop'
$workspace = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$backupDirectory = [System.IO.Path]::GetFullPath($Destination)
$resolvedEnvFile = [System.IO.Path]::GetFullPath((Join-Path $workspace $EnvFile))
$composeArgs = @(
  'compose', '--env-file', $resolvedEnvFile,
  '-f', (Join-Path $workspace 'compose.yaml'),
  '-f', (Join-Path $workspace 'compose.production.yaml'),
  '-f', (Join-Path $workspace 'compose.local-tls.yaml')
)

if (-not $backupDirectory.StartsWith($workspace, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw 'El directorio de backup debe permanecer dentro del workspace.'
}

New-Item -ItemType Directory -Force -Path $backupDirectory | Out-Null
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$filename = "sistema-gimnasio-$timestamp.dump"
$localFile = Join-Path $backupDirectory $filename
$containerFile = "/tmp/$filename"
$containerId = (& docker @composeArgs ps -q database).Trim()

if (-not $containerId) {
  throw 'El contenedor de PostgreSQL no está en ejecución.'
}

try {
  & docker @composeArgs exec -T database sh -c "pg_dump --username=`"`$POSTGRES_USER`" --dbname=`"`$POSTGRES_DB`" --format=custom --file=$containerFile"
  if ($LASTEXITCODE -ne 0) { throw 'pg_dump no pudo generar el backup.' }

  docker cp "${containerId}:$containerFile" $localFile
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo copiar el backup al host.' }

  $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $localFile).Hash
  Set-Content -LiteralPath "$localFile.sha256" -Value "$hash  $filename"

  docker cp $localFile "${containerId}:/tmp/verify-$filename"
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo preparar la verificación del backup.' }
  & docker @composeArgs exec -T database pg_restore --list "/tmp/verify-$filename" | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'El catálogo del backup es inválido.' }
  & docker @composeArgs exec -T database rm -f "/tmp/verify-$filename"

  $cutoff = (Get-Date).AddDays(-$RetentionDays)
  Get-ChildItem -LiteralPath $backupDirectory -Filter 'sistema-gimnasio-*.dump' -File |
    Where-Object LastWriteTime -LT $cutoff |
    ForEach-Object {
      Remove-Item -LiteralPath $_.FullName -Force
      Remove-Item -LiteralPath "$($_.FullName).sha256" -Force -ErrorAction SilentlyContinue
    }
  Write-Host "Backup creado: $localFile"
  Write-Host "SHA256: $hash"
}
finally {
  & docker @composeArgs exec -T database rm -f $containerFile 2>$null
}
