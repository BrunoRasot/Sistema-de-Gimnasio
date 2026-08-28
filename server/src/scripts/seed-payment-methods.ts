import 'dotenv/config';
import { prisma } from '../database/prisma.js';

const metodos = [
  ['Efectivo', 'Billetes y monedas en soles'],
  ['Yape', 'Billetera digital interoperable'], ['Plin', 'Billetera digital interoperable'], ['Bim', 'Billetera móvil'], ['QR interoperable', 'Pago mediante código QR de una entidad interoperable'],
  ['Visa débito', 'Tarjeta de débito Visa'], ['Visa crédito', 'Tarjeta de crédito Visa'], ['Mastercard débito', 'Tarjeta de débito Mastercard'], ['Mastercard crédito', 'Tarjeta de crédito Mastercard'],
  ['American Express', 'Tarjeta American Express'], ['Diners Club', 'Tarjeta Diners Club'], ['UnionPay', 'Tarjeta UnionPay'],
  ['Transferencia BCP', 'Transferencia a cuenta BCP'], ['Transferencia Interbank', 'Transferencia a cuenta Interbank'], ['Transferencia BBVA', 'Transferencia a cuenta BBVA'],
  ['Transferencia Scotiabank', 'Transferencia a cuenta Scotiabank'], ['Transferencia BanBif', 'Transferencia a cuenta BanBif'], ['Transferencia Banco de la Nación', 'Transferencia a cuenta del Banco de la Nación'],
  ['Transferencia bancaria - Otros', 'Transferencia desde otra entidad financiera'], ['Depósito bancario', 'Depósito en ventanilla o agente'],
  ['PagoEfectivo', 'Código CIP de PagoEfectivo'], ['Mercado Pago', 'Billetera o enlace de Mercado Pago'], ['PayPal', 'Pago procesado por PayPal'],
  ['Cheque', 'Cheque bancario sujeto a confirmación'], ['Crédito interno', 'Saldo por cobrar autorizado'], ['Cortesía', 'Operación sin cobro autorizada'],
] as const;

async function main() {
  for (const [nombre, descripcion] of metodos) await prisma.metodoPago.upsert({ where: { nombre }, update: { descripcion, activo: true }, create: { nombre, descripcion, activo: true } });
  console.log(`${metodos.length} métodos de pago verificados.`);
}
main().finally(() => prisma.$disconnect());
