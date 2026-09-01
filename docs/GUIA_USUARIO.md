# Manual de usuario de TemploGym

**Dirigido a:** administradores, recepcionistas y personal autorizado del gimnasio

**Acceso:** <https://templogym-bruno-web.onrender.com>

**Actualización:** septiembre de 2026

## 1. Acerca del sistema

TemploGym administra una sede de gimnasio desde el navegador: clientes, membresías, asistencias, ventas, caja, cuentas por cobrar, inventario, compras, usuarios, alertas, reportes y auditoría.

Cada trabajador debe utilizar su propia cuenta. Las opciones visibles dependen de su rol y permisos.

> Los comprobantes de TemploGym son constancias internas. No sustituyen una boleta o factura electrónica de SUNAT.

## 2. Requisitos

- Dispositivo con Internet y navegador actualizado.
- Usuario y contraseña entregados por el administrador.
- Acceso al correo registrado para recibir códigos de seguridad.

En el plan gratuito, la primera carga tras un periodo sin uso puede tardar aproximadamente 50 segundos. Espere y evite presionar varias veces el mismo botón.

## 3. Acceso al sistema

### Iniciar sesión

1. Abra la dirección del sistema.
2. Escriba su **usuario o correo** y **contraseña**.
3. Seleccione **Iniciar sesión**.
4. Revise su correo e ingrese el código de seis dígitos.
5. Seleccione **Verificar código**.

Si el mensaje no aparece, revise Spam y confirme que utilizó la cuenta correcta.

### Recuperar la contraseña

1. Seleccione **¿Olvidaste tu contraseña?**.
2. Ingrese su usuario o correo y pulse **Enviar código**.
3. Copie el código recibido.
4. Escriba y confirme la nueva contraseña.
5. Seleccione **Cambiar contraseña**.

La contraseña debe tener al menos 12 caracteres e incluir mayúscula, minúscula, número y símbolo.

### Cerrar sesión

Abra el menú del usuario en la parte superior y seleccione **Cerrar sesión**, especialmente al utilizar equipos compartidos.

## 4. Menú y permisos

El menú lateral organiza las funciones. En pantallas pequeñas puede abrirse con el botón superior.

- **ADMIN:** acceso administrativo completo.
- **USER:** acceso según el cargo y los permisos `ver`, `crear`, `editar` y `eliminar`.

Si una opción no aparece, solicite al administrador que revise **Usuarios → Roles y Permisos**.

## 5. Configuración inicial recomendada

Un administrador debe completar lo siguiente en orden:

1. **Configuración → Información del Gimnasio**: identidad, moneda y logotipo.
2. **Pagos → Métodos de Pago**: efectivo, tarjeta, transferencia, etc.
3. **Membresías → Planes y Precios**: duración y precio.
4. **Productos → Categorías** y **Compras → Proveedores**.
5. **Productos → Productos**: catálogo, precios y stock.
6. **Usuarios → Lista de Usuarios**: una cuenta por trabajador.
7. **Usuarios → Roles y Permisos**: acceso mínimo necesario.

## 6. Dashboard y alertas

El **Dashboard** resume membresías, ventas, personal y existencias. En **Dashboard → Centro de Alertas** aparecen:

- productos con stock crítico;
- membresías que vencen en siete días;
- cuentas vencidas por cobrar;
- diferencias recientes de caja.

Las alertas ayudan a priorizar tareas, pero no modifican registros.

## 7. Clientes y membresías

### Registrar un cliente

1. Abra **Membresías → Directorio de Clientes**.
2. Seleccione **Registrar Cliente**.
3. Complete DNI, nombres, apellidos y contacto.
4. Revise y pulse **Guardar Persona**.

Busque primero por DNI para evitar duplicados. Inactivar un cliente conserva su historial.

### Crear un plan

1. Abra **Membresías → Planes y Precios**.
2. Cree un plan con nombre, descripción, precio y duración en días.
3. Seleccione **Crear Plan**.

### Asignar una membresía

1. Abra **Membresías → Miembros Activos**.
2. Seleccione la opción de asignación.
3. Elija cliente, plan y fecha de inicio.
4. Revise el monto y confirme el pago.

### Renovar

- En **Membresías → Renovaciones**, use **Renovar Adelantado**.
- En **Membresías → Membresías Vencidas**, use **Renovar**.

Seleccione plan y fecha, revise el importe y pulse **Confirmar Pago**.

## 8. Asistencias

1. Abra **Asistencias → Registrar ingreso**.
2. Busque al socio por DNI.
3. Verifique su identidad y membresía.
4. Seleccione **Confirmar Ingreso**.

Consulte los registros en **Historial y resumen**. La asistencia se registra manualmente; el QR no marca ingresos.

## 9. Ventas

### Realizar una venta

1. Abra primero la caja si el gimnasio trabaja con turnos.
2. Entre en **Ventas → Nueva Venta**.
3. Busque al cliente o utilice público general.
4. Agregue productos y cantidades.
5. Revise precios, descuentos y total.
6. Seleccione uno o varios métodos de pago.
7. Ingrese el número de operación si corresponde.
8. Confirme una sola vez y espere el mensaje de éxito.

La venta descuenta automáticamente el stock.

### Historial y comprobantes

En **Historial de Ventas** puede localizar operaciones. En **Comprobantes** puede generar o descargar la constancia interna.

### Devolución

1. Abra **Ventas → Devoluciones**.
2. Busque la venta original.
3. Indique productos, cantidades y motivo.
4. Verifique el monto y confirme.

Esta acción puede reponer stock y debe limitarse a personal autorizado.

## 10. Caja y arqueo

### Abrir caja

1. Abra **Caja → Turno y arqueo**.
2. Ingrese el fondo inicial.
3. Seleccione **Abrir caja**.

### Cerrar caja

1. Cuente billetes y monedas e ingrese las cantidades.
2. Revise el valor esperado por método de pago.
3. Ingrese los importes realmente conciliados.
4. Explique cualquier diferencia en **Observaciones**.
5. Pulse **Guardar arqueo y cerrar caja**.

En **Historial de cuadres** puede consultar e imprimir cada cierre.

## 11. Pagos y cuentas por cobrar

En **Pagos → Métodos de Pago**, el administrador crea, edita, activa o desactiva medios de pago. **Pagos → Otros ingresos** conserva el registro general; una anulación permanece para trazabilidad.

Para crear una deuda:

1. Abra **Cuentas por Cobrar** y seleccione **Nueva cuenta**.
2. Elija socio e ingrese concepto, monto, saldo y vencimiento.
3. Guarde.
4. Para cobrar, seleccione **Registrar abono**.
5. Indique método, monto y número de operación.

Los estados posibles son pendiente, parcial, vencida, pagada y anulada.

## 12. Productos, inventario y compras

### Preparar el catálogo

1. Cree categorías en **Productos → Categorías**.
2. Registre proveedores en **Compras → Proveedores**.
3. Cree productos con SKU, categoría, precios, stock y stock mínimo.

El SKU debe ser único. No ingrese cantidades o precios negativos.

### Controlar existencias

- **Productos → Stock y Alertas**: productos bajo el mínimo.
- **Inventario → Kardex y movimientos**: entradas y salidas del stock.

### Registrar una compra

1. Abra **Compras → Órdenes de compra**.
2. Seleccione **Nueva orden**.
3. Elija proveedor, producto, cantidad y costo.
4. Guarde la orden.
5. Al recibir la mercadería, registre la recepción.

La recepción actualiza el stock y costo promedio. Registre solo lo realmente recibido.

## 13. Control SUNAT

TemploGym no emite directamente a SUNAT:

1. Registre la venta en TemploGym.
2. Emita el documento mediante SEE-SOL, PSE u OSE.
3. Abra **Control SUNAT** y pulse **Gestionar**.
4. Registre tipo, estado, canal, documento del cliente, serie, correlativo, fecha y enlace.
5. Seleccione **Guardar**.

## 14. Reportes

El menú **Reportes** incluye ventas, membresías, asistencias, inventario y exportaciones. Aplique los filtros disponibles y verifique el periodo. Contraste cifras importantes con ventas, caja o pagos antes de presentarlas oficialmente.

## 15. Usuarios y auditoría

### Crear un trabajador

1. Abra **Usuarios → Lista de Usuarios**.
2. Seleccione **Nuevo Usuario**.
3. Complete datos, usuario, correo, cargo y contraseña temporal.
4. Use rol `USER`, salvo que necesite acceso administrativo completo.
5. Guarde y pida el cambio de contraseña.

### Asignar permisos

1. Abra **Usuarios → Roles y Permisos**.
2. Seleccione el cargo.
3. Active solo las acciones necesarias.
4. Guarde y pida al trabajador iniciar sesión nuevamente.

**Usuarios → Administradores** gestiona cuentas con acceso total. Mantenga el menor número posible.

En **Auditoría → Registro de actividad** se consultan operaciones sensibles por fecha, usuario, módulo, acción e IP. Los registros son de solo lectura.

## 16. Configuración

- **Información del Gimnasio:** identidad, contacto, dirección, RUC informativo, moneda y logotipo.
- **Notificaciones:** correo de destino y alertas habilitadas.
- **Seguridad:** cambio de contraseña; al finalizar debe iniciar sesión nuevamente.

## 17. Problemas frecuentes

| Situación | Solución |
| --- | --- |
| La primera carga demora | Espere hasta 50 segundos; el servidor puede estar despertando. |
| Credenciales incorrectas | Revise mayúsculas y datos; si persiste, recupere la contraseña. |
| No llega el código | Revise Spam, espere unos minutos y confirme el correo registrado. |
| El código no funciona | Use el más reciente; los anteriores se invalidan o vencen. |
| Una opción no aparece | Solicite al administrador revisar sus permisos. |
| Una operación queda cargando | Espere antes de repetirla; actualice y confirme si fue registrada. |
| Stock insuficiente | Revise existencias y Kardex; reciba la compra si corresponde. |
| Diferencia de caja | Cuente nuevamente, revise pagos y documente la explicación. |
| Error repetido | Anote hora, módulo y acción; tome una captura sin datos sensibles. |

## 18. Buenas prácticas

- No compartir contraseñas, códigos OTP ni cuentas.
- Verificar cliente, monto y método de pago antes de confirmar.
- No repetir clics mientras una operación está procesándose.
- No anular operaciones para ocultar errores; informe la incidencia.
- Cerrar caja y sesión al terminar el turno.
- No publicar capturas con datos personales o credenciales.
- Informar accesos sospechosos o pérdida de dispositivos.

## 19. Solicitar soporte

Indique fecha y hora, módulo, acción, mensaje mostrado y si el problema se repite. Puede adjuntar una captura sin contraseñas, códigos ni datos personales.

Nunca envíe contraseñas, claves de API, cadenas de conexión ni códigos OTP al personal de soporte.
