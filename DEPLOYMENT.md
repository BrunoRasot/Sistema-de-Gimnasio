# Despliegue productivo

## Checklist obligatorio de liberación

- Aplicar migraciones con `prisma migrate deploy` antes de iniciar la API.
- Confirmar HTTPS, dominio, firewall y secretos diferentes para access y refresh tokens.
- Configurar SMTP real y verificar la recuperación de contraseña.
- Abrir y cerrar una caja de prueba, realizar una venta y comprobar su arqueo.
- Emitir un comprobante de prueba en SEE-SOL y registrarlo en Control SUNAT.
- Verificar un abono parcial y el pago total de una cuenta por cobrar.
- Revisar exportaciones, alertas y registros de auditoría.
- Ejecutar un backup, verificar su SHA256 y completar un restore de ensayo fuera de producción.
- Monitorizar `/api/health/live` y `/api/health/ready`.
- Mantener un procedimiento de contingencia para caídas de Internet o del servidor.
- Confirmar que `FRONTEND_URL` sea exactamente el origen HTTPS público, sin ruta ni barra final.
- Ejecutar `pnpm audit --prod` en cliente y servidor y construir las tres imágenes Docker.

TemploGym no almacena la Clave SOL ni emite directamente a SUNAT en esta versión. Sus PDF son documentos internos; la validez fiscal proviene del documento emitido mediante SEE-SOL, PSE u OSE y posteriormente referenciado en el sistema.

Los valores de `.env.production.example` son marcadores deliberadamente inválidos.
Genera secretos independientes, por ejemplo con `openssl rand -base64 48`, y no
reutilices la contraseña de PostgreSQL como secreto JWT. El backend se negará a
arrancar si detecta HTTP en `FRONTEND_URL`, secretos de ejemplo, correo incompleto
o secretos access/refresh iguales.

## Requisitos del servidor

- VPS Linux mantenido, recomendado Ubuntu 24.04 LTS, con al menos 2 CPU, 4 GB de RAM y 40 GB SSD.
- Docker Engine con el plugin Compose.
- Dominio con un registro `A` —y `AAAA` si se usa IPv6— apuntando al servidor.
- Firewall que permita únicamente SSH administrado, HTTP 80 y HTTPS 443. PostgreSQL y el puerto 3000 nunca deben publicarse.
- Usuario de despliegue sin acceso SSH por contraseña y sin iniciar sesión como `root`.

## Preparación

1. Copiar `.env.production.example` a `.env.production`.
2. Generar contraseñas y tres secretos JWT aleatorios y diferentes.
3. Configurar `DOMAIN`, `TLS_EMAIL` y `FRONTEND_URL=https://DOMINIO`.
4. Verificar que `.env.production` no esté versionado ni sea legible por otros usuarios.
5. Crear un backup antes de cada actualización.

Nunca uses literalmente los valores incluidos en el archivo de ejemplo. La
contraseña incluida en `DATABASE_URL` debe estar codificada como componente URL.

## Arranque con HTTPS

```bash
docker compose --env-file .env.production \
  -f compose.yaml -f compose.production.yaml config --quiet
docker compose --env-file .env.production \
  -f compose.yaml -f compose.production.yaml build
docker compose --env-file .env.production \
  -f compose.yaml -f compose.production.yaml up -d
```

Caddy obtiene y renueva automáticamente el certificado TLS. Para emitirlo, el
DNS debe resolver hacia el servidor y los puertos 80/443 deben ser accesibles.

### Ensayo local sin dominio

El repositorio incluye `compose.local-tls.yaml` y `ops/Caddyfile.local` para un
ensayo HTTPS en `https://localhost` usando la CA interna de Caddy. No expongas
esta variante a Internet. En Windows puede iniciarse con:

```powershell
.\scripts\deploy-local-production.ps1 -SeedAdmin
```

La contraseña inicial se lee desde `.secrets/initial-admin-password.txt`, archivo
excluido de Git y restringido al usuario local. Después del primer acceso, cambia
la contraseña y elimina ese archivo. Para el servidor público utiliza únicamente
`compose.yaml` y `compose.production.yaml` con el dominio real.

## Verificación posterior

```bash
docker compose --env-file .env.production \
  -f compose.yaml -f compose.production.yaml ps
curl --fail --silent --show-error https://DOMINIO/healthz
curl --fail --silent --show-error https://DOMINIO/api/health/ready
```

Comprueba también inicio de sesión, renovación de sesión, registro de asistencia,
venta, pago y exportación desde un navegador real.

## Entrega continua

`.github/workflows/ci.yml` valida backend, frontend, cobertura, migraciones e
imágenes en cada pull request y cambio a `main`. `.github/workflows/images.yml`
publica imágenes versionadas en GHCR al crear una etiqueta `v*` o al ejecutarlo
manualmente. Protege `main` en GitHub y exige que todos los jobs de CI terminen
correctamente antes de fusionar.

## Operación mínima

Para la instalación local en Windows:

```powershell
# Crea el dump, SHA-256, valida el catálogo y conserva 30 días
.\scripts\backup.ps1

# Restaura el último dump en PostgreSQL temporal aislado
.\scripts\test-backup-restore.ps1

# Comprueba servicios, API, backup y espacio libre
.\scripts\production-health-check.ps1
```

Las tareas `TemploGym\Backup diario` (02:00) y
`TemploGym\Control de salud` (cada 30 minutos) están previstas para el
Programador de tareas de Windows. Se ejecutan en modo interactivo, por lo que
Docker Desktop y la sesión del usuario deben estar activos.

- Backup diario fuera del VPS, cifrado y con retención mínima de 30 días.
- Restauración de ensayo mensual.
- Alertas externas sobre `/api/health/ready`, expiración TLS, CPU, RAM y disco.
- Rotación periódica de secretos y revocación inmediata ante una filtración.
- Actualizaciones de seguridad mensuales tras pasar CI y un despliegue de prueba.
- Revisión de logs JSON usando `x-request-id` para correlacionar incidencias.

El despliegue no se considera terminado hasta verificar el dominio real, el
certificado, el firewall, el backup externo y las alertas desde otra red.
