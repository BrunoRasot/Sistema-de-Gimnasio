# Copias de seguridad de PostgreSQL

Requiere `pg_dump` y `pg_restore` instalados y disponibles en `PATH`.
En Windows se detecta automáticamente la versión más reciente en `C:\Program Files\PostgreSQL`. También puedes indicar su carpeta `bin` mediante `PG_BIN`.

- Crear: `pnpm backup:create`
- Verificar: `pnpm backup:verify --file=backups/templogym-FECHA.dump`
- Restaurar: `pnpm backup:restore --file=backups/templogym-FECHA.dump --confirm=RESTAURAR_BASE_DE_DATOS`

Cada respaldo genera un manifiesto `.json` con tamaño y SHA-256. La restauración se cancela si el archivo fue alterado. Conserva una copia fuera del equipo y prueba periódicamente la restauración en una base separada.
