import 'dotenv/config.js';
import { z } from 'zod';

const optional = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => (value === '' ? undefined : value), schema.optional());

const envSchema = z
  .object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es obligatoria'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET debe tener al menos 16 caracteres'),
  JWT_ACCESS_SECRET: optional(z.string().min(32, 'JWT_ACCESS_SECRET debe tener al menos 32 caracteres')),
  JWT_REFRESH_SECRET: optional(z.string().min(32, 'JWT_REFRESH_SECRET debe tener al menos 32 caracteres')),
  FRONTEND_URL: optional(z.string().url()),
  EMAIL_USER: optional(z.string().email()),
  EMAIL_PASS: optional(z.string().min(1)),
  EMAIL_FROM: optional(z.string().email()),
  SMTP_HOST: optional(z.string().min(1)),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z.preprocess((value) => value === 'true' || value === true, z.boolean()).default(false),
  ADMIN_INITIAL_PASSWORD: optional(z.string().min(12)),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  })
  .superRefine((value, context) => {
    if (value.NODE_ENV !== 'production') return;
    if (!value.JWT_ACCESS_SECRET) {
      context.addIssue({ code: 'custom', path: ['JWT_ACCESS_SECRET'], message: 'JWT_ACCESS_SECRET es obligatorio en producción' });
    }
    if (!value.JWT_REFRESH_SECRET) {
      context.addIssue({ code: 'custom', path: ['JWT_REFRESH_SECRET'], message: 'JWT_REFRESH_SECRET es obligatorio en producción' });
    }
    if (value.JWT_ACCESS_SECRET && value.JWT_ACCESS_SECRET === value.JWT_REFRESH_SECRET) {
      context.addIssue({ code: 'custom', path: ['JWT_REFRESH_SECRET'], message: 'Los secretos JWT deben ser diferentes' });
    }
    if (!value.EMAIL_USER || !value.EMAIL_PASS) context.addIssue({ code: 'custom', path: ['EMAIL_USER'], message: 'El correo transaccional es obligatorio en producción para entregar OTP' });
    if (!value.FRONTEND_URL) context.addIssue({ code: 'custom', path: ['FRONTEND_URL'], message: 'FRONTEND_URL es obligatorio en producción' });
    if (value.FRONTEND_URL && new URL(value.FRONTEND_URL).protocol !== 'https:') context.addIssue({ code: 'custom', path: ['FRONTEND_URL'], message: 'FRONTEND_URL debe usar HTTPS en producción' });
    for (const [key, secret] of [['JWT_ACCESS_SECRET', value.JWT_ACCESS_SECRET], ['JWT_REFRESH_SECRET', value.JWT_REFRESH_SECRET]] as const) {
      if (secret && /(reemplazar|changeme|example|placeholder)/i.test(secret)) context.addIssue({ code: 'custom', path: [key], message: `${key} conserva un valor de ejemplo` });
    }
  });

export const parseEnv = (source: NodeJS.ProcessEnv) => {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const details = result.error.issues.map((issue) => issue.message).join('; ');
    throw new Error(`Configuración de entorno inválida: ${details}`);
  }
  return Object.freeze({
    ...result.data,
    JWT_ACCESS_SECRET: result.data.JWT_ACCESS_SECRET ?? result.data.JWT_SECRET,
    JWT_REFRESH_SECRET: result.data.JWT_REFRESH_SECRET ?? result.data.JWT_SECRET,
  });
};

export const env = parseEnv(process.env);
