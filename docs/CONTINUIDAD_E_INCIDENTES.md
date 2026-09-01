# Procedimiento de continuidad, fallos e incidentes

> **Plantilla operativa.** Complete responsables, contactos y canales antes de ponerla en vigencia. Los plazos legales deben validarse con el responsable de privacidad o asesor legal.

## 1. Responsables y contactos

| Función | Responsable | Contacto | Reemplazo |
| --- | --- | --- | --- |
| Propietario del servicio | **[COMPLETAR]** | **[COMPLETAR]** | **[COMPLETAR]** |
| Responsable de privacidad | **[COMPLETAR]** | **[COMPLETAR]** | **[COMPLETAR]** |
| Responsable técnico | **[COMPLETAR]** | **[COMPLETAR]** | **[COMPLETAR]** |
| Responsable de caja/operación | **[COMPLETAR]** | **[COMPLETAR]** | **[COMPLETAR]** |

Los accesos de emergencia a Render, Neon, Cloudflare, Brevo, GitHub y monitoreo deben pertenecer al propietario o a una cuenta institucional, con recuperación documentada y segundo factor.

## 2. Clasificación

| Nivel | Ejemplos | Respuesta inicial |
| --- | --- | --- |
| P1 Crítico | Fuga de datos, credencial de producción expuesta, corrupción o pérdida de base, acceso administrativo no autorizado | Inmediata, detener daño y convocar responsables |
| P2 Alto | Sistema fuera de servicio, pagos o caja inconsistentes, correos de acceso caídos | Hasta 30 minutos |
| P3 Medio | Un módulo falla con alternativa manual, lentitud persistente | Mismo día |
| P4 Bajo | Error visual, consulta o mejora sin impacto operativo | Planificación ordinaria |

## 3. Regla principal

Ante un incidente: **contener primero, preservar evidencia y recuperar con verificación**. No elimine registros, no restaure sobre producción sin una copia previa y no publique credenciales ni datos personales en chats o incidencias públicas.

## 4. Flujo de respuesta

1. **Detectar:** registrar hora, usuario, pantalla, acción y mensaje.
2. **Clasificar:** asignar P1-P4 y determinar si involucra datos personales.
3. **Contener:** cerrar sesiones, desactivar cuentas, revocar claves o pausar operaciones afectadas.
4. **Preservar:** guardar logs, eventos, identificadores de despliegue y evidencias sin datos innecesarios.
5. **Analizar:** identificar causa, alcance, sistemas y personas afectadas.
6. **Erradicar:** corregir configuración o código, rotar credenciales y eliminar accesos indebidos.
7. **Recuperar:** desplegar, comprobar salud, ejecutar pruebas funcionales y vigilar recurrencias.
8. **Comunicar:** informar internamente y realizar notificaciones legales cuando correspondan.
9. **Cerrar:** documentar cronología, impacto, acciones, responsable y mejoras.

## 5. Incidentes de datos personales

El responsable debe evaluar de inmediato naturaleza, categorías de datos, número aproximado de afectados, consecuencias y mitigaciones.

El Reglamento de la Ley N.º 29733 contempla, según las condiciones del incidente:

- notificación a la Autoridad Nacional de Protección de Datos Personales dentro de 48 horas desde que se toma conocimiento;
- comunicación clara al titular afectado dentro de 48 horas cuando el incidente afecte otros derechos;
- notificación adicional al Centro Nacional de Seguridad Digital para incidentes en el entorno digital;
- documentación de todos los incidentes, incluso cuando sean resueltos internamente.

La decisión de notificar y su contenido debe validarse con el responsable de privacidad o asesor legal. Si se supera el plazo, se documentan los motivos de la demora.

## 6. Contenido del registro de incidente

- código y nivel;
- fecha/hora de detección y de conocimiento confirmado;
- persona que reporta;
- sistemas, cuentas y datos involucrados;
- cantidad aproximada de afectados;
- causa conocida o probable;
- consecuencias posibles;
- medidas de contención y recuperación;
- evidencias preservadas;
- comunicaciones y notificaciones realizadas;
- fecha de cierre y acciones preventivas.

## 7. Procedimientos por tipo de fallo

### API o frontend no disponible

1. Consultar UptimeRobot y el estado de Render.
2. Revisar el último despliegue y logs sin copiar secretos.
3. Confirmar `/api/health/ready`.
4. Si el despliegue reciente causó el fallo, evaluar rollback al último despliegue estable.
5. Probar login, consulta y una operación controlada antes de declarar recuperación.

### Base de datos no disponible

1. Pausar ventas, pagos, membresías y caja para evitar registros parciales.
2. Revisar el estado de Neon y conectividad desde Render.
3. No cambiar `DATABASE_URL` ni restaurar sin identificar la causa.
4. Si hay pérdida o corrupción, descargar y verificar el respaldo elegido.
5. Restaurar primero en una base aislada y comprobar tablas y datos.
6. Autorizar por escrito cualquier restauración sobre producción.

### Correo OTP o recuperación no funciona

1. Revisar estado y cuota de Brevo.
2. Confirmar que `BREVO_API_KEY` y `EMAIL_FROM` existen en Render sin revelar valores.
3. Revisar logs de la API y actividad transaccional de Brevo.
4. No desactivar OTP como solución temporal.

### Credencial expuesta

1. Revocar o rotar inmediatamente la credencial afectada.
2. Actualizar solo los servicios que deben utilizar la nueva.
3. Volver a desplegar y probar.
4. Revisar logs desde el momento probable de exposición.
5. Eliminar valores de capturas, documentos, historial o incidencias cuando sea viable.
6. Evaluar si la exposición constituye un incidente de datos personales.

### Diferencia de caja o pago

1. No borrar ni editar directamente la base de datos.
2. Conservar comprobante, turno, usuario y hora.
3. Revisar historial de ventas, pagos y auditoría.
4. Registrar observación y escalar al administrador.
5. Corregir mediante los flujos de anulación/devolución autorizados.

## 8. Operación manual temporal

Si el sistema está indisponible, el propietario puede activar un registro manual numerado con:

- fecha y hora;
- responsable;
- cliente mínimo necesario;
- concepto, importe y medio de pago;
- número de comprobante externo;
- observaciones.

El registro se custodia con acceso restringido. Al restablecer el sistema, una persona ingresa los datos y otra los verifica. Se marca cada fila como migrada para evitar duplicados y luego se conserva o elimina conforme a la política aprobada.

## 9. Respaldos y recuperación

- Mantener el respaldo cifrado fuera de Render y Neon.
- Verificar automáticamente integridad y revisar fallos del proceso.
- Realizar una restauración de prueba al menos trimestralmente.
- Conservar la clave de cifrado separada de los respaldos.
- Registrar fecha, archivo, resultado, responsable y número de tablas restauradas.
- Nunca restaurar un respaldo sin verificar hash, descifrado y listado con `pg_restore`.

## 10. Pruebas posteriores

Después de cada recuperación se comprueba:

1. API lista y base de datos activa;
2. login, OTP y recuperación;
3. consulta de clientes y membresías;
4. operación controlada de asistencia;
5. venta, pago y caja en un escenario autorizado;
6. reportes principales;
7. envío de correo;
8. monitoreo sin alertas nuevas.

## 11. Revisión periódica

- Mensual: usuarios, permisos, cuotas, monitoreo y fallos de backups.
- Trimestral: restauración de prueba y revisión de contactos.
- Semestral: simulacro de incidente y rotación planificada de secretos críticos.
- Anual: revisión legal, proveedores, retención y banco de datos inscrito.

Todo incidente P1 o P2 exige una revisión posterior con acciones, responsables y fechas.
