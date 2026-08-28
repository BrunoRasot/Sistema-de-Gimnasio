import {
  LayoutDashboard,
  IdCard,
  User,
  Package,
  ShoppingCart,
  CreditCard,
  CalendarCheck,
  BarChart3,
  Settings,
  Warehouse,
  ClipboardList,
  Landmark,
  LucideIcon
} from 'lucide-react';

export interface SubItem {
  path: string;
  label: string;
  adminOnly?: boolean;
  requiredAction?: 'crear' | 'editar' | 'eliminar';
}

export interface MenuItem {
  path: string;
  label: string;
  icon: LucideIcon;
  subItems?: SubItem[];
}

export interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export const menuGroups: MenuGroup[] = [
  {
    title: 'GENERAL',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }
    ]
  },
  {
    title: 'SOCIOS Y OPERACIÓN',
    items: [
      { 
        path: '/membresias', 
        label: 'Membresías', 
        icon: IdCard,
        subItems: [
          { path: '/membresias/planes', label: 'Planes y Precios' },
          { path: '/membresias/clientes', label: 'Directorio de Clientes' },
          { path: '/membresias/activos', label: 'Miembros Activos' },
          { path: '/membresias/vencidas', label: 'Membresías Vencidas' },
          { path: '/membresias/renovaciones', label: 'Renovaciones' },
        ]
      },
      { 
        path: '/usuarios', 
        label: 'Usuarios', 
        icon: User,
        subItems: [
          { path: '/usuarios/lista', label: 'Lista de Usuarios' },
          { path: '/usuarios/roles', label: 'Roles y Permisos', adminOnly: true },
          { path: '/usuarios/administradores', label: 'Administradores', adminOnly: true },
        ]
      },
    ]
  },
  {
    title: 'COMERCIAL',
    items: [
      {
        path: '/ventas',
        label: 'Ventas',
        icon: ShoppingCart,
        subItems: [
          { path: '/ventas/nueva', label: 'Nueva Venta', requiredAction: 'crear' },
          { path: '/ventas/historial', label: 'Historial de Ventas' },
          { path: '/ventas/devoluciones', label: 'Devoluciones', requiredAction: 'eliminar' },
          { path: '/ventas/comprobantes', label: 'Comprobantes' },
        ]
      },
      {
        path: '/asistencias', label: 'Asistencias', icon: CalendarCheck,
        subItems: [
          { path: '/asistencias/registro', label: 'Registrar ingreso' },
          { path: '/asistencias/resumen', label: 'Historial y resumen' },
        ]
      },
      {
        path: '/caja', label: 'Caja', icon: Landmark,
        subItems: [{ path: '/caja/turno', label: 'Turno y arqueo' }, { path: '/caja/historial', label: 'Historial de cuadres' }]
      },
      { 
        path: '/pagos', label: 'Pagos', icon: CreditCard,
        subItems: [
          { path: '/pagos/registro', label: 'Otros ingresos' },
          { path: '/pagos/metodos', label: 'Métodos de Pago', requiredAction: 'editar' },
        ]
      },
    ]
  },
  {
    title: 'ABASTECIMIENTO',
    items: [
      { 
        path: '/productos', label: 'Productos', icon: Package,
        subItems: [
          { path: '/productos/inventario', label: 'Productos' },
          { path: '/productos/categorias', label: 'Categorías' },
          { path: '/productos/alertas', label: 'Stock y Alertas' },
        ]
      },
      { path: '/inventario', label: 'Inventario', icon: Warehouse, subItems: [{ path: '/inventario/kardex', label: 'Kardex y movimientos' }] },
      { path: '/compras', label: 'Compras', icon: ClipboardList, subItems: [{ path: '/compras/ordenes', label: 'Órdenes de compra' }, { path: '/productos/proveedores', label: 'Proveedores' }] },
    ]
  },
  {
    title: 'REPORTES',
    items: [
      { 
        path: '/reportes', 
        label: 'Reportes', 
        icon: BarChart3,
        subItems: [
          { path: '/reportes/ventas', label: 'Ventas' },
          { path: '/reportes/membresias', label: 'Membresías' },
          { path: '/reportes/asistencias', label: 'Asistencias' },
          { path: '/reportes/inventario', label: 'Inventario' },
        ]
      },
    ]
  },
  {
    title: 'CONFIGURACIÓN',
    items: [
      { 
        path: '/configuracion', 
        label: 'Configuración', 
        icon: Settings,
        subItems: [
          { path: '/configuracion/info', label: 'Información del Gimnasio' },
          { path: '/configuracion/notificaciones', label: 'Notificaciones' },
          { path: '/configuracion/seguridad', label: 'Seguridad' },
        ]
      },
    ]
  }
];
