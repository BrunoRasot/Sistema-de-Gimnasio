import { describe, expect, it } from 'vitest';
import { prisma } from '../../database/prisma.js';

describe('Integridad estructural de PostgreSQL', () => {
  it('mantiene activas las restricciones críticas del dominio', async () => {
    const constraints = await prisma.$queryRaw<Array<{ conname: string }>>`
      SELECT conname
      FROM pg_constraint
      WHERE conname IN (
        'Plan_precio_nonnegative',
        'Plan_duracion_positive',
        'Membresia_monto_nonnegative',
        'Membresia_fechas_validas',
        'Producto_precio_compra_nonnegative',
        'Producto_precio_venta_nonnegative',
        'Producto_stock_nonnegative',
        'Producto_stock_minimo_nonnegative',
        'Venta_total_nonnegative',
        'DetalleVenta_cantidad_positive',
        'Devolucion_monto_nonnegative',
        'DetalleDevolucion_cantidad_positive',
        'Pago_monto_positive'
      )
    `;

    expect(constraints.map(({ conname }) => conname).sort()).toHaveLength(13);
  });

  it('rechaza un plan con precio negativo aunque se omita la API', async () => {
    await expect(
      prisma.plan.create({
        data: {
          nombre: `Plan inválido ${Date.now()}`,
          precio: -1,
          duracionDias: 30,
        },
      }),
    ).rejects.toThrow();
  });
});
