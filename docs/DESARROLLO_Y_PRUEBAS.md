# Desarrollo y pruebas

## Organización del repositorio

```text
sistema-gimnasio/
├── client/                 SPA React
├── server/                 API Express y Prisma
├── docs/                   Documentación funcional y técnica
├── scripts/                Automatización de backup/restore
├── ops/                    Proxy inverso
├── .github/workflows/      Integración y publicación continuas
├── compose.yaml            Stack base
└── compose.production.yaml Extensión HTTPS productiva
```

La arquitectura detallada y las reglas de dependencias se encuentran en [ARCHITECTURE.md](../ARCHITECTURE.md).

## Flujo de desarrollo

1. Crear una rama corta desde `main`.
2. Ejecutar frontend y backend en modo desarrollo.
3. Implementar la regla de negocio en backend y su representación en frontend.
4. Añadir o actualizar pruebas y documentación.
5. Ejecutar validación completa antes de fusionar.

No se deben editar migraciones ya aplicadas. Toda modificación de esquema requiere una migración nueva.

## Validación del backend

```bash
cd server
pnpm run typecheck
pnpm run test:unit
pnpm run test:integration
pnpm run test:e2e
pnpm run test:security
pnpm run test:concurrency
pnpm run test:contracts
pnpm run test:performance
pnpm run test:migrations
pnpm run test:coverage
pnpm run build
```

Las suites que acceden a datos deben usar exclusivamente una base de pruebas descartable. Nunca se ejecutan integración, E2E o concurrencia contra producción.

## Validación del frontend

```bash
cd client
pnpm run lint
pnpm run test:unit
pnpm run test:integration
pnpm run test:security
pnpm run test:contracts
pnpm run test:e2e
pnpm run test:coverage
pnpm run build
```

## Estrategia de pruebas

- **Unitarias:** reglas y utilidades aisladas.
- **Integración:** cooperación entre módulos, controladores, Prisma y servicios.
- **E2E:** recorridos de negocio desde el punto de entrada.
- **Seguridad:** autenticación, CORS, headers, permisos y rate limiting.
- **Contratos:** rutas, payloads y errores esperados.
- **Concurrencia:** stock, renovaciones, devoluciones y asistencia simultánea.
- **Rendimiento:** smoke concurrente para detectar regresiones evidentes.
- **Operacionales:** entorno, salud, errores y restricciones de base de datos.

Los umbrales y la matriz de cobertura vigente se documentan en [ARCHITECTURE.md](../ARCHITECTURE.md). El E2E del cliente usa jsdom; no reemplaza una ejecución Playwright con frontend, API y PostgreSQL reales.

## Definición de terminado

Un cambio está terminado cuando:

- cumple el flujo funcional solicitado;
- el backend aplica autorización y validación;
- las operaciones multi-entidad son transaccionales;
- no expone secretos ni datos sensibles en logs;
- typecheck, lint, pruebas y builds pasan;
- las migraciones son reproducibles;
- la documentación afectada está actualizada.

## Revisión antes de producción

1. Ejecutar auditoría de dependencias de cliente y servidor.
2. Aplicar migraciones a un ambiente efímero restaurado desde backup.
3. Probar login, OTP, recuperación, permisos, venta, devolución, pago y asistencia.
4. Comprobar `/api/health/live` y `/api/health/ready`.
5. Ejecutar un recorrido real de navegador y una prueba de carga controlada.
6. Verificar backup externo, restauración y monitoreo.
