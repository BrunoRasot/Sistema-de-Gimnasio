import { z } from 'zod';

export const passwordSeguraSchema = z
  .string()
  .min(12, 'La contraseña debe tener al menos 12 caracteres')
  .max(128, 'La contraseña no puede superar 128 caracteres')
  .regex(/[a-z]/, 'La contraseña debe incluir una letra minúscula')
  .regex(/[A-Z]/, 'La contraseña debe incluir una letra mayúscula')
  .regex(/\d/, 'La contraseña debe incluir un número')
  .regex(/[^A-Za-z0-9]/, 'La contraseña debe incluir un símbolo');

export const productoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  sku: z.string().min(1, 'El SKU es obligatorio'),
  descripcion: z.string().optional().nullable(),
  precioCompra: z.coerce.number().min(0, 'El precio de compra no puede ser negativo'),
  precioVenta: z.coerce.number().min(0, 'El precio de venta no puede ser negativo'),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo'),
  stockMinimo: z.coerce.number().int().min(0, 'El stock mínimo no puede ser negativo'),
  categoriaId: z.coerce.number().int().positive('La categoría es obligatoria'),
  proveedorId: z.coerce.number().int().positive().optional().nullable(),
  estado: z.string().default('Activo'),
});

export const ventaSchema = z.object({
  cliente: z.string().optional().nullable(),
  metodoId: z.coerce.number().int().positive('El método de pago es obligatorio'),
  numeroOperacion: z.string().optional().nullable(),
  montoRecibido: z.coerce.number().min(0).optional().nullable(),
  vuelto: z.coerce.number().min(0).optional().nullable(),
  items: z
    .array(
      z.object({
        productoId: z.coerce.number().int().positive('El ID del producto es inválido'),
        cantidad: z.coerce.number().int().positive('La cantidad debe ser mayor a 0'),
      }),
    )
    .min(1, 'La venta debe contener al menos un producto'),
});

export const pagoSchema = z.object({
  cliente: z.string().optional().nullable(),
  concepto: z.string().min(1, 'El concepto es obligatorio'),
  monto: z.coerce.number().positive('El monto debe ser mayor a 0'),
  metodoId: z.coerce.number().int().positive('El método de pago es obligatorio'),
});

export const metodoPagoSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().trim().optional().nullable(),
  activo: z.boolean().default(true),
});

export const notificacionesSchema = z.object({
  emailNotificaciones: z.union([z.string().email('Email inválido'), z.literal('')]).optional(),
  nuevasVentas: z.boolean(),
  membresiasVencidas: z.boolean(),
  stockBajo: z.boolean(),
  alertasSistema: z.boolean(),
  reportesSemanales: z.boolean(),
});

export const cambiarPasswordSchema = z.object({
  actual: z.string().min(1, 'La contraseña actual es obligatoria'),
  nueva: passwordSeguraSchema,
});

export const planSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional().nullable(),
  precio: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  duracionDias: z.coerce.number().int().positive('La duración debe ser de al menos 1 día'),
  estado: z.string().default('Activo'),
});

export const miembroSchema = z.object({
  nombres: z.string().min(1, 'Los nombres son obligatorios'),
  apellidos: z.string().min(1, 'Los apellidos son obligatorios'),
  dni: z.string().min(8, 'DNI inválido').max(15),
  email: z.union([z.string().email('Email inválido'), z.literal(''), z.null()]).optional(),
  telefono: z.string().optional().nullable(),
});

export const categoriaSchema = z.object({
  nombre: z.string().min(1, 'El nombre de la categoría es obligatorio'),
  descripcion: z.string().optional().nullable(),
  estado: z.boolean().default(true),
});

export const proveedorSchema = z.object({
  nombre: z.string().min(1, 'El nombre del proveedor es obligatorio'),
  contacto: z.string().optional().nullable(),
  telefono: z.string().optional().nullable(),
  email: z.union([z.string().email('Email inválido'), z.literal(''), z.null()]).optional(),
  direccion: z.string().optional().nullable(),
  estado: z.boolean().default(true),
});

export const configuracionInfoSchema = z.object({
  nombre: z.string().min(1, 'El nombre del gimnasio es obligatorio'),
  ruc: z.string().optional().nullable(),
  telefono: z.string().optional().nullable(),
  email: z.string().email('Email inválido').optional().nullable(),
  direccion: z.string().optional().nullable(),
  moneda: z.string().min(1, 'La moneda es obligatoria'),
  logo: z.string().optional().nullable(),
});

export const permisoSchema = z.object({
  cargo: z.string().min(1, 'El cargo es obligatorio'),
  permisos: z.record(
    z.string(),
    z.object({
      Ver: z.boolean().optional(),
      Crear: z.boolean().optional(),
      Editar: z.boolean().optional(),
      Eliminar: z.boolean().optional(),
    }),
  ),
});

export const asignarMembresiaSchema = z.object({
  miembroId: z.coerce.number().int().positive('El cliente es obligatorio'),
  planId: z.coerce.number().int().positive('El plan es obligatorio'),
  fechaInicio: z.string().date('La fecha de inicio es inválida').optional().nullable(),
});

export const renovarMembresiaSchema = z.object({
  planId: z.coerce.number().int().positive('El plan es obligatorio'),
  fechaInicio: z.string().date('La fecha de inicio es inválida').optional().nullable(),
});
