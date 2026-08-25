import { beforeEach, describe, expect, it } from 'vitest';
import { tokenService } from '../../services/token.service';

describe('tokenService', () => {
  beforeEach(() => localStorage.clear());

  it('devuelve null cuando no existe una sesión', () => {
    expect(tokenService.getAccessToken()).toBeNull();
  });

  it('guarda y recupera el access token', () => {
    tokenService.setAccessToken('token-seguro');
    expect(tokenService.getAccessToken()).toBe('token-seguro');
    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  it('elimina el access token', () => {
    tokenService.setAccessToken('token');
    tokenService.clearAccessToken();
    expect(tokenService.getAccessToken()).toBeNull();
  });
});
