export interface Producto {
  id: string;
  nombre: string;
  sku: string;
  categoria: string;
  precio: number;
  stock: number;
  stockMinimo: number;
  proveedor: string;
  estado: 'Activo' | 'Bajo' | 'Crítico';
}