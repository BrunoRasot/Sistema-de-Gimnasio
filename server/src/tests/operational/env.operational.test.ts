import { describe, expect, it } from 'vitest';
import { parseEnv } from '../../config/env.js';

describe('Configuración operativa', () => {
  const base = {
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://user:pass@localhost:5432/test',
    JWT_SECRET: 'un-secreto-de-pruebas-seguro',
  };

  it('aplica valores por defecto seguros', () => {
    const result = parseEnv(base);
    expect(result.PORT).toBe(3000);
    expect(result.NODE_ENV).toBe('test');
  });

  it.each([
    ['DATABASE_URL', { ...base, DATABASE_URL: '' }],
    ['JWT_SECRET ausente', { ...base, JWT_SECRET: '' }],
    ['JWT_SECRET corto', { ...base, JWT_SECRET: 'corto' }],
    ['PORT inválido', { ...base, PORT: '-1' }],
    ['FRONTEND_URL inválida', { ...base, FRONTEND_URL: 'no-es-url' }],
  ])('impide arrancar con %s', (_nombre, source) => {
    expect(() => parseEnv(source)).toThrow('Configuración de entorno inválida');
  });

  it('convierte variables opcionales vacías en undefined', () => {
    const result = parseEnv({ ...base, BREVO_API_KEY: '', EMAIL_FROM: '' });
    expect(result.BREVO_API_KEY).toBeUndefined();
    expect(result.EMAIL_FROM).toBeUndefined();
  });

  it('exige secretos separados y robustos en producción', () => {
    expect(() => parseEnv({ ...base, NODE_ENV: 'production' })).toThrow(
      'Configuración de entorno inválida',
    );

    const production = parseEnv({
      ...base,
      NODE_ENV: 'production',
      JWT_ACCESS_SECRET: 'access-secret-production-32-bytes-minimum',
      JWT_REFRESH_SECRET: 'refresh-secret-production-32-bytes-minimum',
      BREVO_API_KEY: 'xkeysib-clave-api-brevo-de-prueba',
      EMAIL_FROM: 'otp@test.local',
      FRONTEND_URL: 'https://gym.test.local',
    });
    expect(production.JWT_ACCESS_SECRET).not.toBe(production.JWT_REFRESH_SECRET);
  });

  it('rechaza HTTP y secretos de ejemplo en producción', () => {
    expect(() => parseEnv({ ...base, NODE_ENV: 'production', FRONTEND_URL: 'http://gym.example.com', JWT_ACCESS_SECRET: 'reemplazar-access-secret-32-caracteres', JWT_REFRESH_SECRET: 'reemplazar-refresh-secret-32-caracteres', BREVO_API_KEY: 'xkeysib-clave-api-brevo-de-prueba', EMAIL_FROM: 'otp@test.local' })).toThrow('Configuración de entorno inválida');
  });
});
