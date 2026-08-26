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
    const result = parseEnv({ ...base, EMAIL_USER: '', EMAIL_PASS: '' });
    expect(result.EMAIL_USER).toBeUndefined();
    expect(result.EMAIL_PASS).toBeUndefined();
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
      EMAIL_USER: 'otp@test.local',
      EMAIL_PASS: 'app-password-test',
    });
    expect(production.JWT_ACCESS_SECRET).not.toBe(production.JWT_REFRESH_SECRET);
  });
});
