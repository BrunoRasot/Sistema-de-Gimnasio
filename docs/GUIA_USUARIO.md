# Guía funcional y manual de usuario

## 1. Acceso al sistema

El usuario inicia sesión con su nombre de usuario o correo y contraseña. Si las credenciales son correctas, el sistema envía un OTP de seis dígitos al correo registrado. El acceso se completa al validar el código dentro de su vigencia.

Después de varios intentos fallidos se aplican bloqueos temporales y límites por dirección IP. Si el usuario olvidó la contraseña, puede solicitar un código de recuperación por correo desde la pantalla de acceso.

## 2. Dashboard

El dashboard resume los indicadores principales y permite abrir el módulo relacionado desde tarjetas, gráficos y tablas. Presenta información de membresías, ventas, personal registrado y stock bajo según los permisos del usuario.

## 3. Membresías

### Clientes

- Registrar datos personales y de contacto.
- Buscar un cliente por DNI.
- Inactivar clientes cuando corresponda.
- Consultar su situación comercial.

### Planes

- Crear planes con nombre, descripción, precio y duración en días.
- Editar planes vigentes.
- Inactivar o eliminar según las restricciones del negocio.

### Asignación y renovación

Una membresía relaciona un cliente con un plan, fechas de inicio/fin y monto pagado. La renovación amplía la vigencia respetando la operación transaccional del backend. Un proceso programado marca las membresías vencidas.

## 4. Usuarios, roles y permisos

El administrador gestiona trabajadores, estado de cuenta y restablecimiento de contraseña. Los permisos se asignan por cargo y módulo mediante cuatro acciones: `ver`, `crear`, `editar` y `eliminar`.

Los usuarios con rol `ADMIN` poseen acceso irrestricto. Para usuarios `USER`, el backend aplica la matriz de permisos; ocultar una opción en el frontend es solo una ayuda visual y no sustituye la autorización del servidor.

## 5. Productos e inventario

- Administrar categorías y proveedores.
- Registrar productos con SKU único, precios, stock actual y stock mínimo.
- Consultar alertas cuando el stock alcanza el umbral configurado.
- Mantener valores de stock y precios no negativos.

## 6. Ventas

En Nueva venta se puede buscar automáticamente al cliente por DNI, seleccionar productos y cantidades, aplicar descuentos y registrar uno o varios métodos de pago. El backend valida disponibilidad y descuenta stock dentro de una transacción.

El historial permite consultar ventas. Los comprobantes generados son constancias internas con código QR; no son boletas ni facturas electrónicas. Las devoluciones registran motivo, detalle, monto y reposición de existencias, y actualizan el estado de la venta.

## 7. Pagos

El módulo contiene el registro general de pagos y la administración de métodos. Un pago puede asociarse a un miembro o conservar un nombre de cliente libre. Los registros anulados se mantienen para trazabilidad.

## 8. Asistencias

El personal busca al miembro por DNI y registra la asistencia. El sistema muestra las asistencias del día y evita inconsistencias de concurrencia. El registro actual es manual; el escaneo QR para asistencia no forma parte del alcance implementado.

## 9. Reportes

Los reportes agrupan información de ventas, membresías, asistencias e inventario. Las pantallas permiten consultar indicadores y exportar información cuando la opción está disponible. Los valores deben contrastarse con los registros operativos antes de una presentación oficial.

## 10. Configuración

- **Información del gimnasio:** nombre, RUC informativo, contacto, dirección, logo y moneda.
- **Notificaciones:** correo de destino y tipos de alerta habilitados.
- **Seguridad:** cambio de contraseña con verificación de la contraseña actual.

Las alertas visibles se consultan periódicamente desde la aplicación. El correo transaccional se usa para autenticación y recuperación; cualquier automatización adicional de avisos debe verificarse de acuerdo con el código desplegado.

## 11. Operación segura

- Crear una cuenta individual para cada trabajador; no compartir credenciales.
- Otorgar solo los permisos necesarios para el cargo.
- Cerrar sesión en equipos compartidos.
- Verificar cliente, productos, cantidades y pago antes de confirmar una venta.
- Realizar backups diarios y comprobar restauraciones periódicas.
- No ingresar datos reales en ambientes de desarrollo o pruebas.
