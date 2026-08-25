import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePermisos } from '../../hooks/usePermisos';

describe('usePermisos', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('deniega todas las acciones sin usuario', async () => {
    const { result } = renderHook(() => usePermisos('ventas'));
    await waitFor(() => expect(result.current.cargandoPermisos).toBe(false));
    expect(result.current.permisos).toEqual({ ver: false, crear: false, editar: false, eliminar: false });
  });

  it.each(['ADMIN', 'SUPER_ADMIN'])('concede acceso total al rol %s', async (rol) => {
    localStorage.setItem('usuario', JSON.stringify({ rol }));
    const { result } = renderHook(() => usePermisos('ventas'));
    await waitFor(() => expect(result.current.cargandoPermisos).toBe(false));
    expect(result.current.permisos).toEqual({ ver: true, crear: true, editar: true, eliminar: true });
  });

  it('aplica exactamente la matriz del módulo solicitado', async () => {
    localStorage.setItem('usuario', JSON.stringify({
      rol: 'USER',
      permisos: { ventas: { ver: true, crear: false, editar: true, eliminar: false } },
    }));
    const { result } = renderHook(() => usePermisos('ventas'));
    await waitFor(() => expect(result.current.cargandoPermisos).toBe(false));
    expect(result.current.permisos).toEqual({ ver: true, crear: false, editar: true, eliminar: false });
  });

  it('falla de forma segura ante una sesión corrupta', async () => {
    localStorage.setItem('usuario', '{json-invalido');
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { result } = renderHook(() => usePermisos('ventas'));
    await waitFor(() => expect(result.current.cargandoPermisos).toBe(false));
    expect(result.current.permisos.ver).toBe(false);
  });
});
