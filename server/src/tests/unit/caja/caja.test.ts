import type { Response } from 'express';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '../../../database/prisma.js';
import type { AuthRequest } from '../../../middlewares/auth.middleware.js';
import {
  abrirCaja,
  obtenerCajaActual,
  obtenerHistorialCajas,
  registrarMovimiento,
} from '../../../modules/caja/caja.controller.js';

describe('Caja', () => {
  afterEach(() => vi.restoreAllMocks());

  it('devuelve el historial ordenado y limitado', async () => {
    const historial = [{ id: 1 }];
    const findMany = vi.spyOn(prisma.sesionCaja, 'findMany').mockResolvedValue(historial as never);
    const json = vi.fn();

    await obtenerHistorialCajas({} as AuthRequest, { json } as unknown as Response);

    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({
      orderBy: { abiertaAt: 'desc' },
      take: 100,
    }));
    expect(json).toHaveBeenCalledWith(historial);
  });

  it('devuelve null cuando el usuario no tiene una caja abierta', async () => {
    vi.spyOn(prisma.sesionCaja, 'findFirst').mockResolvedValue(null);
    const json = vi.fn();

    await obtenerCajaActual(
      { usuario: { id: 7 } } as AuthRequest,
      { json } as unknown as Response,
    );

    expect(json).toHaveBeenCalledWith(null);
  });

  it('impide abrir una segunda caja para el mismo usuario', async () => {
    vi.spyOn(prisma.sesionCaja, 'findFirst').mockResolvedValue({ id: 4 } as never);
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));

    await abrirCaja(
      { usuario: { id: 7 }, body: { montoInicial: 100 } } as AuthRequest,
      { status } as unknown as Response,
    );

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith({ mensaje: 'Ya tienes una caja abierta.' });
  });

  it('impide registrar movimientos sin una caja abierta', async () => {
    vi.spyOn(prisma.sesionCaja, 'findFirst').mockResolvedValue(null);
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));

    await registrarMovimiento(
      { usuario: { id: 7 }, body: { tipo: 'INGRESO', monto: 10 } } as AuthRequest,
      { status } as unknown as Response,
    );

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith({ mensaje: 'Debes abrir una caja.' });
  });
});
