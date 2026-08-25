# Política de seguridad

## Sesiones

- Los access tokens duran 15 minutos y solo permanecen en memoria del navegador.
- Los refresh tokens duran siete días, viajan en cookie `HttpOnly` y se almacenan como hash.
- Cada renovación rota el refresh token de manera atómica.
- La reutilización de un refresh token revoca las sesiones persistidas del usuario.
- Cambiar o restablecer una contraseña revoca todos los refresh tokens.

En producción, `JWT_ACCESS_SECRET` y `JWT_REFRESH_SECRET` son obligatorios, deben
ser distintos y contener al menos 32 caracteres aleatorios. Nunca deben guardarse
en el repositorio.

## Reporte de vulnerabilidades

Los hallazgos no deben publicarse en incidencias abiertas. Deben comunicarse al
responsable del despliegue incluyendo versión afectada, reproducción, impacto y
mitigación propuesta.

## Auditoría de dependencias

```bash
cd client && pnpm audit --prod
cd server && pnpm audit --prod
```

Al 24 de agosto de 2026, el cliente no presenta vulnerabilidades conocidas. El
servidor conserva `GHSA-ggr8-5vv4-36mx` en `deepmerge-ts@7.1.5`, dependencia
transitiva de `@prisma/config`. La versión corregida `8.x` no es compatible con
Prisma 7.9.1 y rompe la resolución de `DATABASE_URL`.

La dependencia afectada pertenece al CLI/configurador de migraciones y no al
camino HTTP del servidor compilado. La mitigación temporal es excluir las
herramientas de desarrollo de la imagen final, no procesar configuraciones no
confiables y revisar el aviso al actualizar Prisma. Esta excepción debe cerrarse
cuando Prisma publique una versión compatible; no debe marcarse como resuelta ni
ignorarse silenciosamente en CI.

## Integridad de datos

La base aplica restricciones para evitar precios, montos, cantidades y stock
inválidos, así como membresías cuya fecha final anteceda a la inicial. Toda nueva
regla crítica debe implementarse tanto en validación HTTP como en PostgreSQL.
