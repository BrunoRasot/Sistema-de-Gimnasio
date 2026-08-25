# Despliegue productivo

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

- Backup diario fuera del VPS, cifrado y con retención mínima de 30 días.
- Restauración de ensayo mensual.
- Alertas externas sobre `/api/health/ready`, expiración TLS, CPU, RAM y disco.
- Rotación periódica de secretos y revocación inmediata ante una filtración.
- Actualizaciones de seguridad mensuales tras pasar CI y un despliegue de prueba.
- Revisión de logs JSON usando `x-request-id` para correlacionar incidencias.

El despliegue no se considera terminado hasta verificar el dominio real, el
certificado, el firewall, el backup externo y las alertas desde otra red.

