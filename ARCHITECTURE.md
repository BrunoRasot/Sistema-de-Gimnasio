# Arquitectura del sistema

El repositorio contiene dos aplicaciones independientes:

- `server`: API HTTP con Express, Prisma y PostgreSQL.
- `client`: SPA con React, Vite y React Query.

## Backend

El backend utiliza una arquitectura modular vertical:

```text
server/src/
  config/          Validación centralizada del entorno
  database/        Cliente y adaptador de base de datos
  middlewares/     Autenticación, autorización, auditoría y validación
  modules/         Funcionalidades del negocio
    auth/
    ventas/
    membresias/
    productos/
    ...
  jobs/            Procesos programados
  schemas/         Contratos reutilizados entre módulos
  utils/           Utilidades sin reglas de negocio
  tests/           Pruebas automatizadas
```

Cada carpeta de `modules` es propietaria de sus rutas y controladores. Cuando un
módulo crezca, debe incorporar sus propios archivos `service`, `repository`,
`schema` y `types` dentro de esa misma carpeta. No se deben volver a crear
carpetas globales de controladores o rutas.

`modules/index.ts` es el composition root HTTP: registra los módulos y sus
prefijos. `app.ts` solo configura Express y monta ese router.

## Frontend

```text
client/src/
  modules/         Pantallas y componentes de cada funcionalidad
  components/      Componentes visuales compartidos
  layouts/         Composición general de páginas
  routes/          Definición y protección de rutas
  services/        Cliente HTTP y gateways de la API
  hooks/           Hooks compartidos
  types/           Contratos compartidos
  lib/             Utilidades independientes de React
  test/            Pruebas de interfaz
```

Las pantallas nuevas deben vivir en el módulo al que pertenecen. Los componentes
solo pasan a `components` cuando son usados por más de un módulo. Las rutas cargan
los módulos de forma diferida para mantener pequeño el bundle inicial.

## Reglas de dependencia

1. Un módulo puede usar infraestructura y utilidades compartidas.
2. Los módulos no deben importar controladores o rutas de otro módulo.
3. La validación de datos ocurre en el límite HTTP antes de ejecutar negocio.
4. Las operaciones que modifican varias entidades deben ser transaccionales.
5. La autorización se aplica en backend; el frontend solo refleja esos permisos.
6. Todas las variables de entorno se leen mediante `config/env.ts`.
7. Una refactorización no se considera terminada hasta aprobar typecheck, pruebas,
   lint y compilación de producción.

## Pruebas del backend

La pirámide de pruebas se ejecuta desde `server`:

```bash
pnpm run test:unit
pnpm run test:integration
pnpm run test:e2e
pnpm run test:security
pnpm run test:concurrency
pnpm run test:contracts
pnpm run test:performance
pnpm run test:migrations
pnpm run test:coverage
pnpm run test:all
```

- `unit`: validaciones aisladas y contratos puntuales de los módulos.
- `integration`: cooperación entre API, Prisma y PostgreSQL.
- `e2e`: recorridos de negocio completos desde el endpoint de entrada.
- `security`: tokens, CORS, Helmet, roles y rate limiting.
- `concurrency`: carreras de stock, devoluciones, membresías y asistencias.
- `contracts`: payloads inválidos, límites HTTP y configuración de entorno.
- `performance`: smoke test concurrente para detectar errores de pool o latencias extremas.
- `migrations`: verifica que el esquema configurado tenga todas las migraciones aplicadas.
- `coverage`: genera cobertura V8 y exige los umbrales definidos en `vitest.config.ts`.

Las pruebas de integración y E2E crean identificadores únicos y eliminan sus datos
al terminar. Deben ejecutarse contra una base de datos de pruebas, nunca contra la
base de producción.

### Matriz de cobertura backend

| Módulo | Unit | Integration | E2E |
| --- | :---: | :---: | :---: |
| Autenticación y sesiones | ✓ | ✓ |  |
| Usuarios | ✓ |  | ✓ |
| Roles y permisos |  | ✓ |  |
| Configuración y alertas | ✓ | ✓ |  |
| Planes y membresías | ✓ | ✓ | ✓ |
| Categorías y proveedores | ✓ | ✓ |  |
| Productos e inventario | ✓ | ✓ |  |
| Ventas y devoluciones | ✓ | ✓ |  |
| Pagos y métodos | ✓ | ✓ |  |
| Asistencias | ✓ |  | ✓ |
| Reportes | ✓ | ✓ |  |
| Auditoría y autorización | ✓ | ✓ | ✓ |
| Job de vencimientos |  | ✓ |  |

La cobertura mínima exigida actualmente es 70% de statements, 50% de branches,
75% de funciones y 70% de líneas. Estos umbrales impiden que cambios futuros
reduzcan silenciosamente la cobertura existente.

El smoke test de rendimiento no sustituye una prueba de carga distribuida. Las
pruebas de caída real de PostgreSQL, reconexión, restauración de backups y carga
sostenida deben ejecutarse en infraestructura efímera dedicada, porque implican
detener servicios o crear y eliminar bases completas.

## Pruebas del frontend

La suite del cliente se ejecuta desde `client`:

```bash
pnpm run test:unit
pnpm run test:integration
pnpm run test:security
pnpm run test:contracts
pnpm run test:e2e
pnpm run test:coverage
pnpm run test:all
```

- `unit`: sesión, almacenamiento de tokens y evaluación de permisos.
- `integration`: cooperación entre pantallas, formularios y gateways HTTP.
- `security`: protección de rutas y visibilidad del menú según permisos.
- `contracts`: método, ruta y payload de todos los servicios del cliente.
- `e2e`: recorridos completos de autenticación en un navegador simulado con jsdom.
- `coverage`: cobertura V8 y umbrales de regresión definidos en `vite.config.ts`.

### Matriz de cobertura frontend

| Área | Unit | Integration | Security | Contract | E2E |
| --- | :---: | :---: | :---: | :---: | :---: |
| Autenticación y sesión | ✓ | ✓ | ✓ | ✓ | ✓ |
| Roles, permisos y navegación | ✓ |  | ✓ | ✓ |  |
| Asistencia |  | ✓ |  | ✓ |  |
| Membresías y planes |  | ✓ |  | ✓ |  |
| Productos, proveedores y categorías |  | ✓ |  | ✓ |  |
| Ventas, pagos y devoluciones |  | ✓ |  | ✓ |  |
| Configuración y reportes |  | ✓ |  | ✓ |  |

La barrera inicial exige 30% de statements, 20% de branches, 28% de funciones y
31% de líneas. Debe elevarse conforme se incorporen pruebas detalladas para las
pantallas administrativas que hoy solo están cubiertas mediante sus contratos.
Los E2E actuales son deterministas y no requieren servicios externos; antes de
una entrega productiva también conviene ejecutar recorridos Playwright contra un
entorno efímero con frontend, API y PostgreSQL reales.

## Operación del backend

El artefacto productivo se genera y ejecuta desde `server`:

```bash
pnpm run build
pnpm start
```

`GET /api/health/live` comprueba que el proceso HTTP responde y
`GET /api/health/ready` comprueba además la conexión con PostgreSQL. La segunda
ruta responde `503` cuando la base de datos no está disponible, de modo que un
orquestador no envíe tráfico a una instancia incapaz de atenderlo.

El proceso escucha `SIGTERM` y `SIGINT`. Ante estas señales detiene el job de
membresías, deja de aceptar conexiones, espera el cierre del servidor HTTP y
desconecta Prisma. Las rutas inexistentes y los errores no controlados entregan
contratos JSON consistentes sin revelar detalles internos.

## Seguridad de sesiones e integridad

En producción deben configurarse `JWT_ACCESS_SECRET` y `JWT_REFRESH_SECRET` con
valores aleatorios, distintos y de al menos 32 caracteres. `JWT_SECRET` se
mantiene como compatibilidad exclusiva para desarrollo y pruebas. El access token
dura 15 minutos y se conserva únicamente en memoria del navegador; nunca se
persiste en `localStorage`.

El refresh token dura siete días, se almacena cifrado mediante hash en PostgreSQL
y viaja en una cookie `HttpOnly`, `Secure` en producción, `SameSite=Lax` y limitada
a `/api/auth`. Cada renovación rota el refresh token de forma atómica. Intentar
reutilizar un token rotado revoca las sesiones persistidas del usuario.

Las contraseñas nuevas requieren 12 caracteres, mayúscula, minúscula, número y
símbolo. Cambiar o restablecer una contraseña elimina todos los refresh tokens;
el cambio realizado por el propio usuario también limpia la sesión del cliente.

La migración `20260824223000_integridad_produccion` incorpora restricciones SQL
para precios, montos, stock, cantidades y fechas, además de índices para claves
foráneas y consultas operacionales. De este modo, las invariantes críticas no
dependen solamente de la validación HTTP.

## Despliegue con Docker Compose

La infraestructura productiva está declarada en `compose.yaml`: PostgreSQL 17,
un trabajo de migración de ejecución única, el backend Node.js y el frontend
servido por Nginx. PostgreSQL solo pertenece a una red interna y no publica su
puerto al host. El backend se ejecuta como usuario sin privilegios y el frontend
es el único servicio expuesto.

Antes del primer despliegue, copia `.env.production.example` como
`.env.production` y reemplaza absolutamente todos los valores de ejemplo. Si la
contraseña de PostgreSQL contiene caracteres reservados, codifícala para URL en
`DATABASE_URL`.

```powershell
Copy-Item .env.production.example .env.production
docker compose --env-file .env.production config --quiet
docker compose --env-file .env.production build
docker compose --env-file .env.production up -d
docker compose --env-file .env.production ps
```

Las migraciones se ejecutan antes de iniciar el backend. Un fallo detiene el
arranque dependiente en vez de servir una versión incompatible con la base de
datos. Para inspeccionar el despliegue:

```powershell
docker compose --env-file .env.production logs --no-color migrate backend
Invoke-RestMethod http://localhost:8080/healthz
Invoke-RestMethod http://localhost:8080/api/health/ready
```

El TLS debe terminar en el balanceador o proxy inverso del servidor real. No se
debe publicar este Compose directamente en Internet sin HTTPS, firewall y un
dominio configurado.

## Backups y recuperación

El backup usa el formato personalizado de PostgreSQL y genera un archivo SHA256
adyacente. La restauración exige confirmación explícita, valida primero la
integridad, detiene la aplicación, restaura la base, reaplica migraciones y
reinicia los servicios.

```powershell
.\scripts\backup.ps1
.\scripts\restore.ps1 -BackupFile .\backups\sistema-gimnasio-AAAAMMDD-HHMMSS.dump -ConfirmRestore
```

En producción, programa backups diarios y copia ambos archivos (`.dump` y
`.sha256`) a almacenamiento cifrado fuera del servidor. Conserva al menos 30
días y realiza una restauración de prueba mensual. La existencia del archivo no
demuestra recuperabilidad: el simulacro de restore es parte obligatoria del
procedimiento operacional.
