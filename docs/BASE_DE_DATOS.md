# Modelo de datos

## Visión general

PostgreSQL es la fuente de verdad. Prisma define el modelo en `server/prisma/schema.prisma` y las migraciones versionadas se encuentran en `server/prisma/migrations`.

## Áreas y entidades

| Área | Entidades | Responsabilidad |
| --- | --- | --- |
| Seguridad | `Usuario`, `Permiso`, `RefreshToken`, `PasswordResetToken`, `Auditoria` | Identidad, acceso, sesiones y trazabilidad |
| Membresías | `Plan`, `Miembro`, `Membresia`, `Asistencia` | Clientes, vigencia y control de ingreso |
| Inventario | `Categoria`, `Proveedor`, `Producto` | Catálogo, costos, precios y existencias |
| Ventas | `Venta`, `DetalleVenta`, `VentaPago`, `Devolucion`, `DetalleDevolucion` | Transacciones, pagos mixtos y devoluciones |
| Caja | `MetodoPago`, `Pago` | Métodos y movimientos independientes |
| Sistema | `Configuracion` | Parámetros de la única sede |

## Relaciones principales

```text
Usuario 1 ── N Venta / Pago / Devolucion / Auditoria / RefreshToken
Miembro 1 ── N Membresia / Asistencia / Venta / Pago
Plan 1 ── N Membresia
Categoria 1 ── N Producto
Proveedor 1 ── N Producto
Venta 1 ── N DetalleVenta / VentaPago / Devolucion
Producto 1 ── N DetalleVenta / DetalleDevolucion
MetodoPago 1 ── N Venta / VentaPago / Pago
Devolucion 1 ── N DetalleDevolucion
```

## Reglas relevantes

- DNI, correo y nombre de usuario son únicos para `Usuario`; el DNI también es único para `Miembro`.
- Cada producto tiene un SKU único.
- Un cargo solo puede tener una fila de permiso por módulo.
- Una venta posee código único, detalle de productos y uno o más pagos.
- Un método de pago no puede repetirse dentro de una misma venta mixta.
- Una devolución no repite el mismo producto dentro de su detalle.
- Los refresh tokens y tokens de recuperación se eliminan en cascada al eliminar el usuario.
- Los detalles de venta y devolución se eliminan en cascada con su cabecera.
- La configuración usa una fila global con identificador fijo; por diseño actual la instancia representa una sola sede.

Las migraciones añaden restricciones SQL para montos, precios, cantidades, stock y fechas. Las reglas críticas deben existir tanto en Zod como en la base de datos.

## Estados

- Usuario: rol `ADMIN` o `USER`; cuenta `Activa` o `Bloqueada`; estado general `Activo` o `Inactivo`.
- Membresía: `Activa`, `Vencida` o `Cancelada`.
- Venta/pago: `Completado`, `Pendiente`, `ParcialmenteDevuelto`, `Devuelto` o `Anulado`.

## Migraciones

En desarrollo o despliegue automatizado:

```bash
cd server
pnpm exec prisma migrate deploy
pnpm run test:migrations
```

No se debe usar `prisma db push` en producción porque omite el historial auditable. Antes de una migración productiva se crea un backup y se valida la restauración.

## Seed administrativo

`server/src/prisma/seed.ts` prepara de forma idempotente el administrador inicial y revoca sus sesiones existentes. Requiere `ADMIN_INITIAL_PASSWORD` conforme a la política de contraseñas. La variable debe retirarse del servicio después de ejecutar el seed y no debe quedar escrita en documentación, commits o logs.

## Respaldo

Los comandos de backup generan un dump y manifiesto con SHA-256. Véase [Copias de seguridad](../server/BACKUPS.md). La restauración debe ensayarse sobre una base separada antes de depender de ella para recuperación real.
