import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../database/prisma.js';
import { logger } from '../../utils/logger.js';
import { miembroSchema, asignarMembresiaSchema, renovarMembresiaSchema } from '../../schemas/index.js';

export const obtenerMiembros = async (req: Request, res: Response): Promise<any> => {
  try {
    const miembros = await prisma.miembro.findMany({
      where: { estado: { not: 'Inactivo' } },
      include: {
        membresias: {
          orderBy: { fechaFin: 'desc' },
          take: 1,
          include: { plan: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(miembros);
  } catch (error) {
    logger.error(`Error al obtener miembros: ${error}`);
    return res.status(500).json({ mensaje: 'Error al obtener miembros.' });
  }
};

export const buscarClientePorDni = async (req: Request, res: Response): Promise<any> => {
  try {
    const { dni } = req.params;
    const cliente = await prisma.miembro.findUnique({ where: { dni: String(dni) } });
    if (!cliente) return res.status(404).json({ mensaje: 'Cliente no encontrado en el sistema.' });
    if (cliente.estado === 'Inactivo')
      return res.status(400).json({ mensaje: 'Este cliente está Inactivo/Eliminado.' });
    return res.json(cliente);
  } catch (error) {
    logger.error(`Error al buscar cliente por DNI: ${error}`);
    return res.status(500).json({ mensaje: 'Error al buscar cliente.' });
  }
};

export const crearSoloCliente = async (req: Request, res: Response): Promise<any> => {
  try {
    const datos = req.body as z.infer<typeof miembroSchema>;

    const existeComoTrabajador = await prisma.usuario.findFirst({ where: { dni: datos.dni } });
    if (existeComoTrabajador)
      return res.status(400).json({ mensaje: 'Este DNI pertenece a un TRABAJADOR.' });

    const existeComoCliente = await prisma.miembro.findUnique({ where: { dni: datos.dni } });
    if (existeComoCliente) {
      if (existeComoCliente.estado !== 'Inactivo') {
        return res
          .status(400)
          .json({ mensaje: 'Este DNI ya está registrado y activo en el Directorio.' });
      }
      const clienteReactivado = await prisma.miembro.update({
        where: { id: existeComoCliente.id },
        data: {
          nombres: datos.nombres,
          apellidos: datos.apellidos,
          email: datos.email,
          telefono: datos.telefono,
          estado: 'Activo',
        },
      });
      return res.status(200).json(clienteReactivado);
    }

    const nuevoCliente = await prisma.miembro.create({
      data: {
        nombres: datos.nombres,
        apellidos: datos.apellidos,
        dni: datos.dni,
        email: datos.email,
        telefono: datos.telefono,
        estado: 'Activo',
      },
    });
    return res.status(201).json(nuevoCliente);
  } catch (error) {
    logger.error(`Error al registrar cliente: ${error}`);
    return res.status(500).json({ mensaje: 'Error al registrar al cliente.' });
  }
};

export const asignarMembresia = async (req: Request, res: Response): Promise<any> => {
  try {
    const datos = req.body as z.infer<typeof asignarMembresiaSchema>;

    const [plan, miembro] = await Promise.all([
      prisma.plan.findFirst({ where: { id: datos.planId, estado: 'Activo' } }),
      prisma.miembro.findFirst({ where: { id: datos.miembroId, estado: 'Activo' } }),
    ]);
    if (!plan) return res.status(400).json({ mensaje: 'El plan no existe o está inactivo.' });
    if (!miembro) return res.status(404).json({ mensaje: 'El cliente no existe o está inactivo.' });

    const inicio = datos.fechaInicio ? new Date(datos.fechaInicio) : new Date();
    const fin = new Date(inicio);
    fin.setDate(fin.getDate() + plan.duracionDias);

    const nuevaMembresia = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${datos.miembroId})`;
      const membresiaActiva = await tx.membresia.findFirst({
        where: { miembroId: datos.miembroId, estado: 'Activa' },
      });
      if (membresiaActiva) {
        throw new Error('Este cliente ya tiene una membresía activa.');
      }
      return await tx.membresia.create({
        data: {
          miembroId: datos.miembroId,
          planId: plan.id,
          fechaInicio: inicio,
          fechaFin: fin,
          montoPagado: plan.precio,
          estado: 'Activa',
        },
      });
    });
    return res.status(201).json(nuevaMembresia);
  } catch (error: any) {
    if (error.message === 'Este cliente ya tiene una membresía activa.') {
      return res.status(400).json({ mensaje: error.message });
    }
    logger.error(`Error al asignar la membresía: ${error}`);
    return res.status(500).json({ mensaje: 'Error al asignar la membresía.' });
  }
};

export const inactivarCliente = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    await prisma.$transaction([
      prisma.miembro.update({
        where: { id: Number(id) },
        data: { estado: 'Inactivo' },
      }),
      prisma.membresia.updateMany({
        where: { miembroId: Number(id), estado: 'Activa' },
        data: { estado: 'Cancelada' },
      }),
    ]);
    return res.json({ mensaje: 'Cliente inactivado correctamente.' });
  } catch (error) {
    logger.error(`Error al inactivar cliente: ${error}`);
    return res.status(500).json({ mensaje: 'Error al inactivar al cliente.' });
  }
};

export const renovarMembresia = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const datos = req.body as z.infer<typeof renovarMembresiaSchema>;

    const plan = await prisma.plan.findFirst({ where: { id: datos.planId, estado: 'Activo' } });
    if (!plan) {
      return res.status(400).json({ mensaje: 'El plan seleccionado no existe o está inactivo.' });
    }

    const miembro = await prisma.miembro.findUnique({ where: { id: Number(id) } });
    if (!miembro) return res.status(404).json({ mensaje: 'Cliente no encontrado.' });

    const nuevaMembresia = await prisma.$transaction(async (tx) => {
      const miembroId = Number(id);
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${miembroId})`;
      const ultimaMembresia = await tx.membresia.findFirst({
        where: { miembroId },
        orderBy: { fechaFin: 'desc' },
      });
      const ahora = new Date();
      const inicio = datos.fechaInicio
        ? new Date(datos.fechaInicio)
        : ultimaMembresia?.estado === 'Activa' && ultimaMembresia.fechaFin > ahora
          ? new Date(ultimaMembresia.fechaFin)
          : ahora;
      const fin = new Date(inicio);
      fin.setDate(fin.getDate() + plan.duracionDias);

      if (datos.fechaInicio || !ultimaMembresia || ultimaMembresia.fechaFin <= ahora) {
        await tx.membresia.updateMany({
          where: { miembroId, estado: 'Activa' },
          data: { estado: 'Vencida' },
        });
      }
      const mem = await tx.membresia.create({
        data: {
          miembroId,
          planId: plan.id,
          fechaInicio: inicio,
          fechaFin: fin,
          montoPagado: plan.precio,
          estado: 'Activa',
        },
      });
      await tx.miembro.update({
        where: { id: miembroId },
        data: { estado: 'Activo' },
      });
      return mem;
    });
    return res.status(201).json(nuevaMembresia);
  } catch (error: any) {
    logger.error(`Error al renovar membresía: ${error}`);
    return res.status(500).json({ mensaje: 'Error interno al procesar la renovación.' });
  }
};

