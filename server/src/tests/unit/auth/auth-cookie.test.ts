import { describe, expect, it } from 'vitest';
import { createRefreshCookieOptions } from '../../../modules/auth/auth-cookie.js';

describe('cookie de renovación de sesión', () => {
  it('permite credenciales entre el frontend y la API en producción', () => {
    expect(createRefreshCookieOptions(true)).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/api/auth',
    });
  });

  it('mantiene una política estricta durante el desarrollo local', () => {
    expect(createRefreshCookieOptions(false)).toMatchObject({
      secure: false,
      sameSite: 'strict',
    });
  });
});
