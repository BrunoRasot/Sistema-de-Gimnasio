param(
  [switch]$SeedAdmin
)

$ErrorActionPreference = 'Stop'
$workspace = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $workspace '.env.production'
$passwordFile = Join-Path $workspace '.secrets\initial-admin-password.txt'
$composeArgs = @(
  'compose', '--env-file', $envFile,
  '-f', (Join-Path $workspace 'compose.yaml'),
  '-f', (Join-Path $workspace 'compose.production.yaml'),
  '-f', (Join-Path $workspace 'compose.local-tls.yaml')
)

if (-not (Test-Path -LiteralPath $envFile)) {
  throw 'Falta .env.production.'
}

if (-not (Test-Path -LiteralPath '\\.\pipe\dockerDesktopLinuxEngine')) {
  throw 'Docker Desktop no tiene activo el motor Linux. Ejecuta primero scripts\repair-docker-desktop.ps1 desde PowerShell como Administrador.'
}

& docker @composeArgs config --quiet
if ($LASTEXITCODE -ne 0) { throw 'La configuración Compose no es válida.' }
& docker @composeArgs build
if ($LASTEXITCODE -ne 0) { throw 'No se pudieron construir las imágenes.' }
& docker @composeArgs up -d database migrate backend frontend gateway
if ($LASTEXITCODE -ne 0) { throw 'No se pudo iniciar la plataforma.' }

if ($SeedAdmin) {
  if (-not (Test-Path -LiteralPath $passwordFile)) { throw 'Falta la contraseña inicial protegida.' }
  $initialPassword = (Get-Content -LiteralPath $passwordFile -Raw).Trim()
  & docker @composeArgs run --rm -e "ADMIN_INITIAL_PASSWORD=$initialPassword" migrate node dist/prisma/seed.js
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo preparar el administrador inicial.' }
}

& docker @composeArgs ps
Write-Host 'TemploGym disponible en https://localhost'
