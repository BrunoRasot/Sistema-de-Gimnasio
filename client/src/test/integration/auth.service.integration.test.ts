import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../services/api';
import { loginService, logoutService, verifyOtpService } from '../../services/auth.service';
import { tokenService } from '../../services/token.service';

vi.mock('../../services/api', () => ({ api: { post: vi.fn() } }));

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('Integración del servicio de autenticación con la sesión local', () => {
  beforeEach(() => {
    localStorage.clear();
    tokenService.clearAccessToken();
    vi.clearAllMocks();
  });

  it('envía las credenciales con el contrato esperado', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ mensaje: 'OTP enviado' }) });
    await loginService('admin', 'Password-123!');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ usuario: 'admin', password: 'Password-123!' }),
      }),
    );
  });

  it('propaga un error de credenciales sin guardar sesión', async () => {
    fetchMock.mockResolvedValue({ ok: false });
    await expect(loginService('admin', 'mala')).rejects.toThrow('Credenciales incorrectas');
    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  it('verifica OTP, mantiene el token en memoria y persiste el perfil', async () => {
    const usuario = { id: 1, rol: 'ADMIN', cargo: 'Administrador', nombreUsuario: 'admin' };
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ token: 'access-token', usuario }) });
    await verifyOtpService('admin', '123456');
    expect(tokenService.getAccessToken()).toBe('access-token');
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('usuarioRol')).toBe('ADMIN');
    expect(localStorage.getItem('usuarioCargo')).toBe('Administrador');
    expect(JSON.parse(localStorage.getItem('usuario')!)).toEqual(usuario);
  });

  it('no persiste datos cuando el OTP es inválido', async () => {
    fetchMock.mockResolvedValue({ ok: false });
    await expect(verifyOtpService('admin', '000000')).rejects.toThrow('Código inválido');
    expect(localStorage.length).toBe(0);
  });

  it('limpia toda la sesión aunque el logout remoto falle', async () => {
    tokenService.setAccessToken('token');
    localStorage.setItem('usuario', '{}');
    localStorage.setItem('usuarioRol', 'ADMIN');
    localStorage.setItem('usuarioCargo', 'Administrador');
    vi.mocked(api.post).mockRejectedValue(new Error('sin red'));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await logoutService();
    expect(tokenService.getAccessToken()).toBeNull();
    expect(localStorage.getItem('usuario')).toBeNull();
    expect(localStorage.getItem('usuarioRol')).toBeNull();
    expect(localStorage.getItem('usuarioCargo')).toBeNull();
  });
});
