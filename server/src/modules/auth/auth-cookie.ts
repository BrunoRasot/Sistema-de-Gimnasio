import type { CookieOptions } from 'express';
import { env } from '../../config/env.js';

const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api/auth',
  maxAge: sevenDaysMs,
};

export const clearRefreshCookieOptions: CookieOptions = {
  httpOnly: refreshCookieOptions.httpOnly,
  secure: refreshCookieOptions.secure,
  sameSite: refreshCookieOptions.sameSite,
  path: refreshCookieOptions.path,
};

export const refreshTokenExpiresAt = () => new Date(Date.now() + sevenDaysMs);
