import { Request, Response } from 'express';
import { prisma } from '../database/prisma.js';

export const obtenerMiembros = async (req: Request, res: Response): Promise<any> => {
  try {
    const miembros = await prisma.miembro.findMany({
      where: { estado: { not: 'Inactivo' } },
      include: {
        membresias: {
          orderBy: { fechaFin: 'desc' },
          take: 1,
          include: { plan: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(miembros);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al obtener miembros.' });
  }
};

export const buscarClientePorDni = async (req: Request, res: Response): Promise<any> => {
  try {
    const { dni } = req.params;
    const cliente = await prisma.miembro.findUnique({ where: { dni: String(dni) } });

    if (!cliente) return res.status(404).json({ mensaje: 'Cliente no encontrado en el sistema.' });
    if (cliente.estado === 'Inactivo') return res.status(400).json({ mensaje: 'Este cliente está Inactivo/Eliminado.' });

    return res.json(cliente);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al buscar cliente.' });
  }
};

export const crearSoloCliente = async (req: Request, res: Response): Promise<any> => {
  try {
    const { nombres, apellidos, dni, email, telefono } = req.body;

    const existeComoTrabajador = await prisma.usuario.findFirst({ where: { dni } });
    if (existeComoTrabajador) return res.status(400).json({ mensaje: 'Este DNI pertenece a un TRABAJADOR.' });
    const existeComoCliente = await prisma.miembro.findUnique({ where: { dni } });

    if (existeComoCliente) {
      if (existeComoCliente.estado !== 'Inactivo') {
        return res.status(400).json({ mensaje: 'Este DNI ya está registrado y activo en el Directorio.' });
      }
      const clienteReactivado = await prisma.miembro.update({
        where: { id: existeComoCliente.id },
        data: {
          nombres,
          apellidos,
          email,
          telefono,
          estado: 'Activo'
        }
      });

      return res.status(200).json(clienteReactivado);
    }
    const nuevoCliente = await prisma.miembro.create({
      data: { nombres, apellidos, dni, email, telefono, estado: 'Activo' }
    });

    return res.status(201).json(nuevoCliente);
  } catch (error) {
    console.error("Error al registrar cliente:", error);
    return res.status(500).json({ mensaje: 'Error al registrar al cliente.' });
  }
};

export const asignarMembresia = async (req: Request, res: Response): Promise<any> => {
  try {
    const { miembroId, planId, fechaInicio } = req.body;

    if (!miembroId) return res.status(400).json({ mensaje: 'Debe buscar y seleccionar un cliente.' });

    const plan = await prisma.plan.findUnique({ where: { id: Number(planId) } });
    if (!plan) return res.status(404).json({ mensaje: 'Plan no encontrado.' });

    const inicio = new Date(fechaInicio);
    const fin = new Date(inicio);
    fin.setDate(fin.getDate() + plan.duracionDias);

    const nuevaMembresia = await prisma.membresia.create({
      data: {
        miembroId: Number(miembroId),
        planId: plan.id,
        fechaInicio: inicio,
        fechaFin: fin,
        montoPagado: plan.precio,
        estado: 'Activa'
      }
    });

    return res.status(201).json(nuevaMembresia);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al asignar la membresía.' });
  }
};

export const inactivarCliente = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    await prisma.miembro.update({
      where: { id: Number(id) },
      data: { estado: 'Inactivo' }
    });
    return res.json({ mensaje: 'Cliente inactivado correctamente.' });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al inactivar al cliente.' });
  }
};

export const renovarMembresia = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params; // ID del cliente
    const { planId, fechaInicio } = req.body;

    if (!planId) return res.status(400).json({ mensaje: 'Debe seleccionar un plan para la renovación.' });

    const plan = await prisma.plan.findUnique({ where: { id: Number(planId) } });
    if (!plan) return res.status(404).json({ mensaje: 'El plan seleccionado no existe.' });

    const inicio = fechaInicio ? new Date(fechaInicio) : new Date();
    const fin = new Date(inicio);
    fin.setDate(fin.getDate() + plan.duracionDias);

    await prisma.membresia.updateMany({
      where: {
        miembroId: Number(id),
        estado: 'Activa'
      },
      data: { estado: 'Vencida' }
    });

    const nuevaMembresia = await prisma.membresia.create({
      data: {
        miembroId: Number(id),
        planId: plan.id,
        fechaInicio: inicio,
        fechaFin: fin,
        montoPagado: plan.precio,
        estado: 'Activa'
      }
    });

    await prisma.miembro.update({
      where: { id: Number(id) },
      data: { estado: 'Activo' }
    });

    return res.status(201).json(nuevaMembresia);
  } catch (error) {
    console.error("Error al renovar membresía:", error);
    return res.status(500).json({ mensaje: 'Error interno al procesar la renovación.' });
  }
};