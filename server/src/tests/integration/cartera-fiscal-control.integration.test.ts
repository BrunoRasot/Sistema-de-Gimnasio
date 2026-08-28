import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { prisma } from '../../database/prisma.js';
import { crearAdminDePrueba } from '../helpers/testAdmin.js';

describe('Integración: salida a producción, cartera y control fiscal', () => {
  let token = ''; let limpiarAdmin: () => Promise<void>; let adminId = 0; let miembroId = 0; let metodoId = 0; let cuentaId = 0; let ventaId = 0;
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  beforeAll(async () => { const a = await crearAdminDePrueba('prod-control'); token = a.token; limpiarAdmin = a.limpiar; adminId = a.admin.id; const m = await prisma.miembro.create({ data: { nombres: 'Socio', apellidos: 'Cartera', dni: String(Math.floor(10000000 + Math.random() * 89999999)) } }); miembroId = m.id; const mp = await prisma.metodoPago.create({ data: { nombre: `Transferencia ${suffix}` } }); metodoId = mp.id; });
  afterAll(async () => { if (cuentaId) { await prisma.abonoCuentaCobrar.deleteMany({ where: { cuentaId } }); await prisma.cuentaCobrar.deleteMany({ where: { id: cuentaId } }); } if (ventaId) await prisma.venta.deleteMany({ where: { id: ventaId } }); await prisma.miembro.deleteMany({ where: { id: miembroId } }); await prisma.metodoPago.deleteMany({ where: { id: metodoId } }); await prisma.auditoria.deleteMany({ where: { usuarioId: adminId } }); await limpiarAdmin(); });

  it('crea una deuda y registra un abono parcial sin exceder el saldo', async () => {
    const created = await request(app).post('/api/cartera').set('Authorization', `Bearer ${token}`).send({ miembroId, concepto: 'Membresía mensual', montoTotal: 100, saldoInicial: 100, fechaVencimiento: new Date(Date.now() + 86400000).toISOString() });
    expect(created.status).toBe(201); cuentaId = created.body.id;
    const abono = await request(app).post(`/api/cartera/${cuentaId}/abonos`).set('Authorization', `Bearer ${token}`).send({ metodoId, monto: 40, numeroOperacion: `OP-${suffix}` });
    expect(abono.status).toBe(201);
    const cuenta = await prisma.cuentaCobrar.findUniqueOrThrow({ where: { id: cuentaId } }); expect(Number(cuenta.saldo)).toBe(60); expect(cuenta.estado).toBe('PARCIAL');
    const exceso = await request(app).post(`/api/cartera/${cuentaId}/abonos`).set('Authorization', `Bearer ${token}`).send({ metodoId, monto: 61, numeroOperacion: `OP2-${suffix}` }); expect(exceso.status).toBe(400);
  });

  it('vincula una referencia SEE-SOL validada con una venta interna', async () => {
    const venta = await prisma.venta.create({ data: { codigo: `VNT-${suffix}`, cliente: 'Cliente fiscal', total: 118, subtotal: 100, descuento: 0, metodoId } }); ventaId = venta.id;
    const result = await request(app).put(`/api/fiscal/${ventaId}`).set('Authorization', `Bearer ${token}`).send({ tipo: 'FACTURA', estado: 'EMITIDO', proveedor: 'SEE_SOL', clienteTipoDoc: 'RUC', clienteNumeroDoc: '20600000001', clienteRazonSocial: 'Cliente Fiscal SAC', serie: 'F001', correlativo: String(Date.now()), fechaEmision: new Date().toISOString() });
    expect(result.status).toBe(200); expect(result.body.ventaId).toBe(ventaId);
  });

  it('expone alertas, auditoría y exportación solo autenticadas', async () => {
    expect((await request(app).get('/api/control/alertas').set('Authorization', `Bearer ${token}`)).status).toBe(200);
    expect((await request(app).get('/api/control/auditoria').set('Authorization', `Bearer ${token}`)).status).toBe(200);
    const csv = await request(app).get('/api/control/exportar/cartera').set('Authorization', `Bearer ${token}`); expect(csv.status).toBe(200); expect(csv.headers['content-type']).toContain('text/csv');
    expect((await request(app).get('/api/control/auditoria')).status).toBe(401);
  });
});
