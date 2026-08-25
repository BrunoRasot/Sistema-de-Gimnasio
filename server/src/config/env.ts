import 'dotenv/config';
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
  ADMIN_INITIAL_PASSWORD: optional(z.string().min(12)),
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
