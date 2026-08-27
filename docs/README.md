# Índice de documentación

Esta carpeta centraliza la documentación operativa y académica de TemploGym.

| Documento | Público objetivo | Contenido |
| --- | --- | --- |
| [README principal](../README.md) | Todos | Descripción, requisitos e inicio rápido |
| [Guía de usuario](GUIA_USUARIO.md) | Administrador y personal | Flujos funcionales y reglas de uso |
| [API REST](API.md) | Desarrollo e integración | Rutas, autenticación y permisos |
| [Base de datos](BASE_DE_DATOS.md) | Desarrollo y tesis | Entidades, relaciones e integridad |
| [Desarrollo y pruebas](DESARROLLO_Y_PRUEBAS.md) | Equipo técnico | Convenciones, comandos y estrategia de pruebas |
| [Arquitectura](../ARCHITECTURE.md) | Equipo técnico | Organización interna y decisiones técnicas |
| [Despliegue](../DEPLOYMENT.md) | DevOps/administrador | Publicación con Docker y HTTPS |
| [Backups](../server/BACKUPS.md) | Operación | Creación, verificación y restauración |
| [Seguridad](../SECURITY.md) | Desarrollo/operación | Sesiones, secretos, dependencias y reporte |

## Alcance funcional

TemploGym gestiona la administración diaria de un gimnasio: personal, clientes, membresías, inventario, ventas, pagos y asistencias. No incluye facturación electrónica SUNAT, programación de clases grupales ni operación multi-sede.

## Criterio de actualización

Todo cambio que agregue una ruta, variable de entorno, tabla, permiso o flujo visible debe actualizar el documento correspondiente dentro del mismo cambio de código. La documentación describe el estado del repositorio, no planes futuros.
