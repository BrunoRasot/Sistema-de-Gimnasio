import { Request, Response } from 'express';
import { prisma } from '../../database/prisma.js';

export const getReporteVentas = async (req: Request, res: Response): Promise<any> => {
  try {
    const ventas = await prisma.venta.findMany({ where: { estado: 'Completado' } });
    const ingresosTotales = ventas.reduce((acc, v) => acc + Number(v.total), 0);
    const ventasCompletadas = ventas.length;
    const ticketPromedio = ventasCompletadas > 0 ? ingresosTotales / ventasCompletadas : 0;

    const ventasPorFecha = ventas.reduce((acc: any, v) => {
      const fecha = new Date(v.createdAt).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
      });
      acc[fecha] = (acc[fecha] || 0) + Number(v.total);
      return acc;
    }, {});

    const chartData = Object.keys(ventasPorFecha).map((k) => ({
      fecha: k,
      ingresos: ventasPorFecha[k],
    }));

    return res.json({ ingresosTotales, ventasCompletadas, ticketPromedio, chartData });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al generar reporte de ventas' });
  }
};

export const getReporteMembresias = async (req: Request, res: Response): Promise<any> => {
  try {
    const miembros = await prisma.miembro.findMany({
      include: {
        membresias: {
          where: { estado: 'Activa' },
          include: { plan: true },
        },
      },
    });

    const activos = miembros.filter((m) => m.estado === 'Activo').length;
    const inactivos = miembros.filter((m) => m.estado === 'Inactivo').length;

    const planesCount = miembros.reduce((acc: any, m) => {
      if (m.estado === 'Activo' && m.membresias.length > 0) {
        const plan = m.membresias[0].plan?.nombre || 'Desconocido';
        acc[plan] = (acc[plan] || 0) + 1;
      }
      return acc;
    }, {});

    const chartData = Object.keys(planesCount).map((k) => ({ name: k, value: planesCount[k] }));

    return res.json({ total: miembros.length, activos, inactivos, chartData });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al generar reporte de membresías' });
  }
};

export const getReporteAsistencias = async (req: Request, res: Response): Promise<any> => {
  try {
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);

    const asistencias = await prisma.asistencia.findMany({
      where: { fechaHora: { gte: inicioDia } },
    });

    const porHora = asistencias.reduce((acc: any, a) => {
      const hora = new Date(a.fechaHora).getHours();
      const label = `${hora}:00`;
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});

    const chartData = Object.keys(porHora)
      .map((k) => ({ hora: k, ingresos: porHora[k] }))
      .sort((a, b) => parseInt(a.hora) - parseInt(b.hora));

    const picoHora =
      chartData.length > 0
        ? chartData.reduce((prev, current) => (prev.ingresos > current.ingresos ? prev : current))
            .hora
        : '--:--';

    return res.json({ total: asistencias.length, picoHora, chartData });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al generar reporte de asistencias' });
  }
};

export const getReporteInventario = async (req: Request, res: Response): Promise<any> => {
  try {
    const productos = await prisma.producto.findMany();
    let valorTotal = 0;
    let bajoStockCount = 0;

    productos.forEach((p) => {
      valorTotal += Number(p.stock) * Number(p.precioVenta);
      if (Number(p.stock) <= Number(p.stockMinimo)) bajoStockCount++;
    });

    const chartData = [...productos]
      .map((p) => ({
        nombre: p.nombre.substring(0, 15) + (p.nombre.length > 15 ? '...' : ''),
        valorStock: Number(p.stock) * Number(p.precioVenta),
      }))
      .sort((a, b) => b.valorStock - a.valorStock)
      .slice(0, 5);

    return res.json({ total: productos.length, valorTotal, bajoStockCount, chartData });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al generar reporte de inventario' });
  }
};

