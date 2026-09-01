# Copias de seguridad de PostgreSQL

Requiere `pg_dump` y `pg_restore` instalados y disponibles en `PATH`.
En Windows se detecta automáticamente la versión más reciente en `C:\Program Files\PostgreSQL`. También puedes indicar su carpeta `bin` mediante `PG_BIN`.

- Crear: `pnpm backup:create`
- Verificar: `pnpm backup:verify --file=backups/templogym-FECHA.dump`
- Restaurar: `pnpm backup:restore --file=backups/templogym-FECHA.dump --confirm=RESTAURAR_BASE_DE_DATOS`

Cada respaldo genera un manifiesto `.json` con tamaño y SHA-256. La restauración se cancela si el archivo fue alterado. Conserva una copia fuera del equipo y prueba periódicamente la restauración en una base separada.

## Respaldo de producción

El workflow `.github/workflows/database-backup.yml` crea cada día a las 03:00 (hora de Perú) un `pg_dump` de Neon, lo restaura en PostgreSQL 18 para comprobarlo, lo cifra con AES-256 y lo sube al bucket privado `templogym-backups` de Cloudflare R2. Los objetos con más de 30 días se eliminan automáticamente.

También puede ejecutarse manualmente desde **GitHub > Actions > Backup Neon to Cloudflare R2 > Run workflow**.

Secretos requeridos en GitHub Actions:

- `NEON_DATABASE_URL`: conexión directa de Neon, no la URL del pooler.
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_ENDPOINT`
- `BACKUP_ENCRYPTION_KEY`: clave que debe conservarse fuera de GitHub, porque sin ella no se pueden descifrar los respaldos.

Para descifrar una copia descargada:

```powershell
openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -in templogym-FECHA.dump.enc -out templogym-FECHA.dump
```

OpenSSL solicitará `BACKUP_ENCRYPTION_KEY`. Después se puede verificar con `pg_restore --list templogym-FECHA.dump` y restaurar siguiendo el procedimiento anterior.
