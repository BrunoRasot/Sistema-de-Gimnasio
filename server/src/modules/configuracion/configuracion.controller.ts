import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../../database/prisma.js';
import { configuracionInfoSchema } from '../../schemas/index.js';
import { logger } from '../../utils/logger.js';

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
    return res.status(500).json({ mensaje: 'Error al obtener la configuración' });
  }
};

export const actualizarInfo = async (req: Request, res: Response): Promise<any> => {
  try {
    const datos = req.body as z.infer<typeof configuracionInfoSchema>;
    const logo = req.body.logo;

    await obtenerConfig();
    const configActualizada = await prisma.configuracion.update({
      where: { id: 1 },
      data: {
        nombre: datos.nombre,
        ruc: datos.ruc ?? '',
        telefono: datos.telefono ?? '',
        email: datos.email ?? '',
        direccion: datos.direccion ?? '',
        moneda: datos.moneda,
        logo,
        tipoEmpresa: datos.tipoEmpresa,
        fechaInscripcion: datos.fechaInscripcion,
        fechaInicioActividades: datos.fechaInicioActividades,
        estadoRuc: datos.estadoRuc,
        condicionRuc: datos.condicionRuc,
      },
    });
    return res.json({ mensaje: 'Información actualizada', config: configActualizada });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al actualizar información' });
  }
};

export const actualizarNotificaciones = async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      emailNotificaciones,
      nuevasVentas,
      membresiasVencidas,
      stockBajo,
      alertasSistema,
      reportesSemanales,
    } = req.body;
    await obtenerConfig();
    const configActualizada = await prisma.configuracion.update({
      where: { id: 1 },
      data: {
        emailNotificaciones,
        nuevasVentas,
        membresiasVencidas,
        stockBajo,
        alertasSistema,
        reportesSemanales,
      },
    });
    return res.json({ mensaje: 'Notificaciones actualizadas', config: configActualizada });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al actualizar notificaciones' });
  }
};

export const cambiarPassword = async (req: Request, res: Response): Promise<any> => {
  try {
    const usuarioId = (req as any).usuario?.id;
    const { actual, nueva } = req.body;

    const usuario = await prisma.usuario.findUnique({ where: { id: Number(usuarioId) } });
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    const passwordCorrecta = await bcrypt.compare(actual, usuario.password);
    if (!passwordCorrecta) {
      return res.status(400).json({ mensaje: 'La contraseña actual es incorrecta' });
    }

    const hashedPassword = await bcrypt.hash(nueva, 10);
    await prisma.$transaction([
      prisma.usuario.update({
        where: { id: Number(usuarioId) },
        data: { password: hashedPassword },
      }),
      prisma.refreshToken.deleteMany({ where: { usuarioId: Number(usuarioId) } }),
    ]);

    return res.json({ mensaje: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al cambiar la contraseña' });
  }
};

export const obtenerAlertasTiempoReal = async (req: Request, res: Response): Promise<any> => {
  try {
    const config = await obtenerConfig();
    const alertas: any[] = [];
    const usuarioId = Number((req as any).usuario?.id);
    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId }, select: { rol: true, cargo: true } });
    if (!usuario) return res.status(401).json({ mensaje: 'Usuario no encontrado.' });
    const permisos = usuario.rol === 'ADMIN' ? [] : await prisma.permiso.findMany({ where: { cargo: usuario.cargo, ver: true }, select: { modulo: true } });
    const puede = (modulo: string) => usuario.rol === 'ADMIN' || permisos.some((p) => p.modulo === modulo);

    if (config.nuevasVentas && puede('ventas')) {
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

    if (config.membresiasVencidas && puede('membresias')) {
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

    if (config.stockBajo && (puede('productos') || puede('inventario'))) {
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

    if (config.reportesSemanales && puede('reportes')) {
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

    if (config.alertasSistema && puede('configuracion')) {
      const usuariosActivos = await prisma.usuario.count({ where: { activo: true } });
      const productosActivos = await prisma.producto.count({ where: { estado: 'Activo' } });

      alertas.push({
        id: 'sistema-estado',
        tipo: 'sistema',
        texto: `Sistema operativo con normalidad: ${usuariosActivos} usuario(s) activos y ${productosActivos} producto(s) en catálogo.`,
        hora: 'Ahora',
        leida: false,
      });
    }

    return res.json(alertas);
  } catch (error) {
    logger.error('Error al obtener alertas en tiempo real', { error });
    return res.status(500).json({ mensaje: 'Error al obtener alertas en tiempo real' });
  }
};

