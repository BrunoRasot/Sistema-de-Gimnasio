# TemploGym — Sistema de gestión para gimnasio

TemploGym es una aplicación web para administrar las operaciones principales de un gimnasio: clientes, membresías, personal, roles y permisos, inventario, ventas, pagos, asistencias, reportes y configuración.

El repositorio contiene una SPA React y una API REST Express conectada a PostgreSQL mediante Prisma.

## Funcionalidades

- Autenticación con contraseña, OTP por correo, renovación de sesión y recuperación de contraseña.
- Administración de usuarios, cargos y permisos por módulo y acción.
- Clientes, planes, asignación, renovación y vencimiento automático de membresías.
- Productos, categorías, proveedores, existencias y alertas de stock.
- Punto de venta, descuentos, pagos mixtos, comprobantes internos y devoluciones.
- Registro y resumen de asistencias.
- Reportes de ventas, membresías, asistencias e inventario.
- Configuración del gimnasio, preferencias de notificación y cambio de contraseña.
- Auditoría, validación de datos, controles de concurrencia y copias de seguridad.

## Tecnologías

| Capa | Tecnologías principales |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, React Router, React Query |
| Backend | Node.js, Express 5, TypeScript, Zod, JWT, Nodemailer |
| Datos | PostgreSQL 17, Prisma 7 |
| Pruebas | Vitest, Testing Library, Supertest, jsdom |
| Operación | Docker, Docker Compose, Nginx, Caddy, GitHub Actions |

## Inicio rápido local

Requisitos: Node.js compatible con las dependencias, pnpm y PostgreSQL.

1. Crear una base PostgreSQL vacía.
2. Copiar `server/.env.example` como `server/.env` y completar sus valores.
3. Instalar y preparar el backend:

```powershell
cd server
pnpm install
pnpm exec prisma migrate deploy
pnpm run seed
pnpm run dev
```

El seed exige `ADMIN_INITIAL_PASSWORD` y actualiza o crea el administrador inicial. No debe dejarse activado automáticamente después de preparar producción.

4. En otra terminal, iniciar el frontend:

```powershell
cd client
pnpm install
pnpm run dev
```

5. Abrir `http://localhost:5173`. La API escucha de forma predeterminada en `http://localhost:3000`.

## Variables esenciales

| Variable | Uso |
| --- | --- |
| `DATABASE_URL` | Cadena de conexión PostgreSQL |
| `JWT_SECRET` | Compatibilidad en desarrollo; mínimo 16 caracteres |
| `JWT_ACCESS_SECRET` | Firma de access tokens; obligatorio en producción |
| `JWT_REFRESH_SECRET` | Firma de refresh tokens; distinto al anterior |
| `FRONTEND_URL` | Origen permitido por CORS |
| `EMAIL_USER` / `EMAIL_PASS` | Credenciales SMTP para OTP y recuperación |
| `EMAIL_FROM` | Remitente validado en el proveedor de correo |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` | Conexión SMTP |
| `ADMIN_INITIAL_PASSWORD` | Contraseña temporal usada solo por el seed |

Nunca se deben versionar `.env`, claves SMTP, contraseñas, tokens o cadenas de producción.

## Comandos principales

Backend, desde `server`:

```bash
pnpm run dev
pnpm run build
pnpm run typecheck
pnpm run test:all
pnpm run test:coverage
pnpm run backup:create
```

Frontend, desde `client`:

```bash
pnpm run dev
pnpm run build
pnpm run lint
pnpm run test:all
pnpm run test:coverage
```

## Documentación

- [Índice de documentación](docs/README.md)
- [Guía funcional y manual de usuario](docs/GUIA_USUARIO.md)
- [Referencia de la API](docs/API.md)
- [Modelo de datos](docs/BASE_DE_DATOS.md)
- [Desarrollo y pruebas](docs/DESARROLLO_Y_PRUEBAS.md)
- [Arquitectura](ARCHITECTURE.md)
- [Despliegue](DEPLOYMENT.md)
- [Copias de seguridad](server/BACKUPS.md)
- [Política de seguridad](SECURITY.md)

## Estado y alcance

El sistema cubre una sola sede por instancia. Los comprobantes son internos y no constituyen documentos tributarios SUNAT. Los E2E del frontend usan jsdom; para una liberación definitiva se recomienda añadir Playwright contra un entorno completo y efectuar pruebas reales de carga, restauración y caída de infraestructura.

## Licencia

El backend declara licencia ISC. Antes de distribuir públicamente el proyecto, conviene definir una licencia única para todo el repositorio y añadir el archivo `LICENSE` correspondiente.
