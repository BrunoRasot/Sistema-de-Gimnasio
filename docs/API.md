# Referencia de la API REST

## Convenciones

- URL base local: `http://localhost:3000/api`.
- Cuerpos y respuestas: JSON, salvo recursos explícitamente binarios.
- Rutas protegidas: `Authorization: Bearer <access-token>`.
- Renovación: cookie `HttpOnly` enviada a `/api/auth`.
- Errores de validación: HTTP `400`; autenticación `401`; autorización `403`; conflicto `409`; límites `429`; error interno `500`.
- Los esquemas exactos de entrada están en `server/src/schemas/index.ts`.

## Autenticación

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| POST | `/auth/login` | Público | Valida credenciales y solicita OTP |
| POST | `/auth/verificar-otp` | Público limitado | Valida OTP y crea sesión |
| POST | `/auth/refresh-token` | Cookie | Rota el refresh token y entrega access token |
| POST | `/auth/logout` | Cookie | Revoca la sesión y limpia la cookie |
| POST | `/auth/solicitar-recuperacion` | Público limitado | Envía código de recuperación |
| POST | `/auth/restablecer-password` | Público limitado | Restablece la contraseña con código válido |

Los endpoints públicos sensibles tienen rate limiting. Las contraseñas requieren al menos 12 caracteres, mayúscula, minúscula, número y símbolo.

## Salud

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/health/live` | Confirma que el proceso responde |
| GET | `/health/ready` | Confirma proceso y conexión PostgreSQL; responde 503 si falla |

## Usuarios y permisos

| Método | Ruta | Permiso |
| --- | --- | --- |
| GET | `/usuarios` | `usuarios.ver` |
| GET | `/usuarios/:id` | `usuarios.ver` |
| POST | `/usuarios` | `usuarios.crear` |
| PUT | `/usuarios/:id` | `usuarios.editar` |
| DELETE | `/usuarios/:id` | `usuarios.eliminar` |
| PATCH | `/usuarios/:id/estado` | `usuarios.editar` |
| PATCH | `/usuarios/:id/restablecer-password` | `usuarios.editar` |
| GET | `/permisos/mios` | Usuario autenticado |
| GET | `/permisos/cargos` | Administrador |
| GET | `/permisos` | Administrador |
| POST | `/permisos` | Administrador |

## Membresías y planes

| Método | Ruta | Permiso |
| --- | --- | --- |
| GET | `/planes` | `membresias.ver` |
| POST | `/planes` | `membresias.crear` |
| PUT | `/planes/:id` | `membresias.editar` |
| DELETE | `/planes/:id` | `membresias.eliminar` |
| GET | `/miembros` | `membresias.ver` |
| GET | `/miembros/buscar/:dni` | `membresias.ver` |
| POST | `/miembros/cliente` | `membresias.crear` |
| POST | `/miembros/asignar-membresia` | `membresias.crear` |
| PATCH | `/miembros/:id/inactivar` | `membresias.eliminar` |
| POST | `/miembros/:id/renovar` | `membresias.editar` |

## Inventario

Las categorías, proveedores y productos utilizan el permiso del módulo `productos`.

| Recurso | Listar | Crear | Actualizar | Eliminar |
| --- | --- | --- | --- | --- |
| Categorías | `GET /categorias` | `POST /categorias` | `PUT /categorias/:id` | `DELETE /categorias/:id` |
| Proveedores | `GET /proveedores` | `POST /proveedores` | `PUT /proveedores/:id` | `DELETE /proveedores/:id` |
| Productos | `GET /productos` | `POST /productos` | `PUT /productos/:id` | `DELETE /productos/:id` |

## Ventas y devoluciones

| Método | Ruta | Permiso |
| --- | --- | --- |
| GET | `/ventas` | `ventas.ver` |
| POST | `/ventas` | `ventas.crear` |
| GET | `/ventas/comprobantes/:id` | `ventas.ver` |
| GET | `/ventas/devoluciones` | `ventas.ver` |
| POST | `/ventas/devoluciones` | `ventas.eliminar` |

La creación de una venta valida totales, existencias, métodos de pago y pagos mixtos. Los cambios de stock y detalles se realizan transaccionalmente.

## Pagos

| Método | Ruta | Permiso |
| --- | --- | --- |
| GET | `/pagos/metodos` | `pagos.ver` |
| POST | `/pagos/metodos` | `pagos.crear` |
| PUT | `/pagos/metodos/:id` | `pagos.editar` |
| GET | `/pagos` | `pagos.ver` |
| POST | `/pagos` | `pagos.crear` |
| PATCH | `/pagos/:id/anular` | `pagos.eliminar` |

## Asistencias

| Método | Ruta | Permiso |
| --- | --- | --- |
| POST | `/asistencias/registrar` | `asistencias.crear` |
| GET | `/asistencias/hoy` | `asistencias.ver` |
| GET | `/asistencias/buscar/:dni` | `asistencias.ver` |

## Reportes

Todos requieren `reportes.ver`: `GET /reportes/ventas`, `/reportes/membresias`, `/reportes/asistencias` y `/reportes/inventario`.

## Configuración

| Método | Ruta | Acceso |
| --- | --- | --- |
| GET | `/configuracion` | `configuracion.ver` |
| GET | `/configuracion/alertas-tiempo-real` | Autenticado |
| PUT | `/configuracion/info` | `configuracion.editar` |
| PUT | `/configuracion/notificaciones` | `configuracion.editar` |
| POST | `/configuracion/cambiar-password` | Autenticado |

## Auditoría

Las operaciones mutables relevantes pasan por el middleware de auditoría y guardan usuario, módulo, acción, detalles, dirección IP y fecha. No se deben registrar contraseñas, OTP, tokens ni secretos.
# Operaciones comerciales nuevas

- `GET /api/inventario/kardex`: movimientos de inventario; acepta `productoId`.
- `POST /api/inventario/ajustes`: ajuste justificado de existencias.
- `GET /api/compras` y `POST /api/compras`: consulta y creación de órdenes.
- `POST /api/compras/:id/recepciones`: recepción parcial o total con actualización de stock y costo.
- `GET /api/caja/actual` y `GET /api/caja/historial`: sesión vigente e historial.
- `POST /api/caja/abrir`, `/movimientos` y `/cerrar`: ciclo de caja y arqueo.

Estas rutas requieren token y permisos de `inventario`, `compras` o `caja`.
