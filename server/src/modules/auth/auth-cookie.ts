import type { CookieOptions } from 'express';
import { env } from '../../config/env.js';

const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

export const createRefreshCookieOptions = (isProduction: boolean): CookieOptions => ({
  httpOnly: true,
  secure: isProduction,
  // El frontend y la API se publican en orígenes distintos. En producción,
  // el navegador solo enviará la cookie en las peticiones CORS con SameSite=None.
  sameSite: isProduction ? 'none' : 'strict',
  path: '/api/auth',
  maxAge: sevenDaysMs,
});

export const refreshCookieOptions = createRefreshCookieOptions(env.NODE_ENV === 'production');

export const clearRefreshCookieOptions: CookieOptions = {
  httpOnly: refreshCookieOptions.httpOnly,
  secure: refreshCookieOptions.secure,
  sameSite: refreshCookieOptions.sameSite,
  path: refreshCookieOptions.path,
};

export const refreshTokenExpiresAt = () => new Date(Date.now() + sevenDaysMs);
