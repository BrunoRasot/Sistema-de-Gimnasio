# Política de seguridad

## Sesiones

- Los access tokens duran 15 minutos y solo permanecen en memoria del navegador.
- Los refresh tokens duran siete días, viajan en cookie `HttpOnly` y se almacenan como hash.
- Cada renovación rota el refresh token de manera atómica.
- La reutilización de un refresh token revoca las sesiones persistidas del usuario.
- Cambiar o restablecer una contraseña revoca todos los refresh tokens.
- Las cookies de sesión son `HttpOnly`, `Secure` y `SameSite=Strict` en producción.
- La API rechaza mutaciones declaradas por el navegador como `cross-site` y exige el origen configurado para renovar o cerrar sesiones basadas en cookie.
- La verificación JWT acepta exclusivamente HS256 y consulta que el usuario continúe activo.

En producción, `JWT_ACCESS_SECRET` y `JWT_REFRESH_SECRET` son obligatorios, deben
ser distintos y contener al menos 32 caracteres aleatorios. Nunca deben guardarse
en el repositorio.

## Reporte de vulnerabilidades

Los hallazgos no deben publicarse en incidencias abiertas. Deben comunicarse al
responsable del despliegue incluyendo versión afectada, reproducción, impacto y
mitigación propuesta.

## Controles HTTP y de infraestructura

- CORS usa exclusivamente `FRONTEND_URL` en producción; localhost solo se permite en desarrollo y pruebas.
- Las respuestas de API llevan `Cache-Control: no-store` y no revelan Express mediante `X-Powered-By`.
- Helmet, CSP, `frame-ancestors`, `nosniff`, política de referer y Permissions Policy se aplican en API/proxy.
- Login, OTP, recuperación y renovación de sesión tienen límites independientes.
- Los cuerpos mutables deben ser JSON y poseen límites estrictos de tamaño.
- Los logos solo admiten PNG, JPEG o WebP y la auditoría omite su contenido base64.
- Backend, frontend y gateway se ejecutan sin privilegios, con filesystem de solo lectura, límites de procesos y capacidades reducidas donde corresponde.
- La imagen HTTP de backend no incluye dependencias de desarrollo ni ejecuta migraciones al arrancar; el trabajo `migrate` es independiente.

## Auditoría de dependencias

```bash
cd client && pnpm audit --prod
cd server && pnpm audit --prod
```

Al 28 de agosto de 2026, `pnpm audit --prod` no reporta vulnerabilidades conocidas
ni en cliente ni en servidor. La imagen final del backend excluye además las
dependencias de desarrollo. Esta comprobación debe repetirse en cada liberación;
un resultado limpio solo significa que el registro consultado no conoce una
vulnerabilidad aplicable en ese momento.

## Integridad de datos

La base aplica restricciones para evitar precios, montos, cantidades y stock
inválidos, así como membresías cuya fecha final anteceda a la inicial. Toda nueva
regla crítica debe implementarse tanto en validación HTTP como en PostgreSQL.
