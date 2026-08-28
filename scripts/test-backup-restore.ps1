param(
  [string]$BackupFile = '',
  [string]$EnvFile = '.env.production'
)

$ErrorActionPreference = 'Stop'
$workspace = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if (-not $BackupFile) {
  $latest = Get-ChildItem -LiteralPath (Join-Path $workspace 'backups') -Filter 'sistema-gimnasio-*.dump' -File |
    Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if (-not $latest) { throw 'No existe un backup productivo para probar.' }
  $BackupFile = $latest.FullName
}
$resolvedBackup = [System.IO.Path]::GetFullPath($BackupFile)
if (-not $resolvedBackup.StartsWith($workspace, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw 'El backup de ensayo debe permanecer dentro del workspace.'
}
$checksumFile = "$resolvedBackup.sha256"
if (-not (Test-Path -LiteralPath $checksumFile)) { throw 'Falta el SHA256 del backup.' }
$expected = ((Get-Content -LiteralPath $checksumFile -Raw).Trim() -split '\s+')[0]
$actual = (Get-FileHash -Algorithm SHA256 -LiteralPath $resolvedBackup).Hash
if ($expected -ne $actual) { throw 'El SHA256 del backup no coincide.' }

$envValues = @{}
Get-Content -LiteralPath (Join-Path $workspace $EnvFile) | ForEach-Object {
  if ($_ -match '^([^#=]+)=(.*)$') { $envValues[$matches[1]] = $matches[2].Trim('"').Trim("'") }
}
$containerName = "templogym-restore-test-$([guid]::NewGuid().ToString('N').Substring(0, 8))"
try {
  docker run --detach --rm --name $containerName --tmpfs /var/lib/postgresql/data `
    -e "POSTGRES_DB=$($envValues.POSTGRES_DB)" `
    -e "POSTGRES_USER=$($envValues.POSTGRES_USER)" `
    -e "POSTGRES_PASSWORD=$($envValues.POSTGRES_PASSWORD)" postgres:17-alpine | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo iniciar PostgreSQL temporal.' }

  $ready = $false
  foreach ($attempt in 1..30) {
    docker exec $containerName pg_isready --username $envValues.POSTGRES_USER --dbname $envValues.POSTGRES_DB 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) { $ready = $true; break }
    Start-Sleep -Seconds 1
  }
  if (-not $ready) { throw 'PostgreSQL temporal no quedó listo.' }

  docker cp $resolvedBackup "${containerName}:/tmp/restore-test.dump"
  docker exec $containerName pg_restore --username $envValues.POSTGRES_USER --dbname $envValues.POSTGRES_DB `
    --clean --if-exists --no-owner --no-privileges --exit-on-error /tmp/restore-test.dump
  if ($LASTEXITCODE -ne 0) { throw 'Falló la restauración de ensayo.' }
  $tableCount = docker exec $containerName psql --username $envValues.POSTGRES_USER --dbname $envValues.POSTGRES_DB `
    --tuples-only --no-align -c "SELECT count(*) FROM pg_tables WHERE schemaname='public';"
  if ($LASTEXITCODE -ne 0 -or [int]$tableCount -lt 1) { throw 'La restauración no contiene tablas públicas.' }
  Write-Host "Restauración de ensayo correcta: $tableCount tablas públicas."
}
finally {
  docker rm --force $containerName 2>$null | Out-Null
}
