import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../database/prisma.js';

const obtenerConfig = async () => {
  let config = await prisma.configuracion.findUnique({ where: { id: 1 } });
  if (!config) {
    config = await prisma.configuracion.create({ data: { id: 1 } });
  }
  return config;
};

export const obtenerConfiguracion = async (req: Request, res: Response): Promise<any> => {
  try {
    const config = await obtenerConfig();
    return res.json(config);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener la configuración' });
  }
};

export const actualizarInfo = async (req: Request, res: Response): Promise<any> => {
  try {
    const { nombre, ruc, telefono, email, direccion, moneda, logo } = req.body;
    await obtenerConfig();
    const configActualizada = await prisma.configuracion.update({
      where: { id: 1 },
      data: { nombre, ruc, telefono, email, direccion, moneda, logo },
    });
    return res.json({ message: 'Información actualizada', config: configActualizada });
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar información' });
  }
};

export const actualizarNotificaciones = async (req: Request, res: Response): Promise<any> => {
  try {
    const { nuevasVentas, membresiasVencidas, stockBajo, alertasSistema, reportesSemanales } =
      req.body;
    await obtenerConfig();
    const configActualizada = await prisma.configuracion.update({
      where: { id: 1 },
      data: { nuevasVentas, membresiasVencidas, stockBajo, alertasSistema, reportesSemanales },
    });
    return res.json({ message: 'Notificaciones actualizadas', config: configActualizada });
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar notificaciones' });
  }
};

export const cambiarPassword = async (req: Request, res: Response): Promise<any> => {
  try {
    const usuarioId = (req as any).usuario?.id;
    const { actual, nueva } = req.body;

    const usuario = await prisma.usuario.findUnique({ where: { id: Number(usuarioId) } });
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });

    const passwordCorrecta = await bcrypt.compare(actual, usuario.password);
    if (!passwordCorrecta) {
      return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
    }

    const hashedPassword = await bcrypt.hash(nueva, 10);
    await prisma.usuario.update({
      where: { id: Number(usuarioId) },
      data: { password: hashedPassword },
    });

    return res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al cambiar la contraseña' });
  }
};

export const obtenerAlertasTiempoReal = async (req: Request, res: Response): Promise<any> => {
  try {
    const config = await obtenerConfig();
    const alertas: any[] = [];

    if (config.nuevasVentas) {
      const ayer = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const ultimasVentas = await prisma.venta.findMany({
        where: { createdAt: { gte: ayer } },
        take: 3,
        orderBy: { createdAt: 'desc' },
      });
      ultimasVentas.forEach((v) => {
        alertas.push({
          id: `venta-${v.id}`,
          tipo: 'venta',
          texto: `Nueva venta registrada (${v.codigo}) por S/ ${Number(v.total).toFixed(2)}.`,
          hora: 'Reciente',
          leida: false,
        });
      });
    }

    if (config.membresiasVencidas) {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() + 3);

      const membresiasProximas = await prisma.membresia.findMany({
        where: {
          estado: 'Activa',
          fechaFin: { lte: fechaLimite },
        },
        include: { miembro: true },
        take: 3,
      });

      membresiasProximas.forEach((m) => {
        alertas.push({
          id: `membresia-${m.id}`,
          tipo: 'vencimiento',
          texto: `Membresía de ${m.miembro.nombres} ${m.miembro.apellidos} está próxima a vencer.`,
          hora: 'Próximo',
          leida: false,
        });
      });
    }

    if (config.stockBajo) {
      const productos = await prisma.producto.findMany({
        where: { estado: 'Activo' },
      });

      const productosCriticos = productos.filter((p) => p.stock <= p.stockMinimo);
      productosCriticos.slice(0, 3).forEach((p) => {
        alertas.push({
          id: `stock-${p.id}`,
          tipo: 'stock',
          texto: `Stock crítico en ${p.nombre} (Quedan ${p.stock} unidades).`,
          hora: 'Inventario',
          leida: false,
        });
      });
    }

    if (config.reportesSemanales) {
      const inicioSemana = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const ventasSemana = await prisma.venta.findMany({
        where: { createdAt: { gte: inicioSemana }, estado: 'Completado' },
      });
      const totalIngresosSemana = ventasSemana.reduce((acc, v) => acc + Number(v.total), 0);

      alertas.push({
        id: 'reporte-semanal',
        tipo: 'reporte',
        texto: `Resumen semanal: Se recaudaron S/ ${totalIngresosSemana.toFixed(2)} en los últimos 7 días.`,
        hora: 'Semanal',
        leida: false,
      });
    }

    if (config.alertasSistema) {
      alertas.push({
        id: 'sistema-mantenimiento',
        tipo: 'sistema',
        texto: 'Mantenimiento del sistema programado para el fin de semana. Funciones estables.',
        hora: 'Sistema',
        leida: false,
      });
    }

    return res.json(alertas);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener alertas en tiempo real' });
  }
};
