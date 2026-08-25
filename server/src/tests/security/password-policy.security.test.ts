import { describe, expect, it } from 'vitest';
import { passwordSeguraSchema } from '../../schemas/index.js';

describe('Política de contraseñas', () => {
  it.each([
    'Corta-1!',
    'SINMINUSCULAS-123!',
    'sinmayusculas-123!',
    'SinNumeros-Segura!',
    'SinSimbolosSegura123',
  ])('rechaza la contraseña débil %s', (password) => {
    expect(passwordSeguraSchema.safeParse(password).success).toBe(false);
  });

  it('acepta una contraseña con todos los factores exigidos', () => {
    expect(passwordSeguraSchema.safeParse('Segura-Tesis-2026!').success).toBe(true);
  });
});
