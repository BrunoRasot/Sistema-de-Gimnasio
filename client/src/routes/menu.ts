import {
  LayoutDashboard,
  IdCard,
  User,
  Package,
  ShoppingCart,
  CreditCard,
  CalendarCheck,
  BarChart3,
  Settings
} from 'lucide-react';

export const menuGroups = [
  {
    title: 'GENERAL',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }
    ]
  },
  {
    title: 'GESTIÓN',
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
          { path: '/usuarios/roles', label: 'Roles y Permisos' },
          { path: '/usuarios/administradores', label: 'Administradores' },
        ]
      },
      { 
        path: '/productos', 
        label: 'Productos', 
        icon: Package,
        subItems: [
          { path: '/productos/inventario', label: 'Inventario' },
          { path: '/productos/categorias', label: 'Categorías' },
          { path: '/productos/proveedores', label: 'Proveedores' },
          { path: '/productos/alertas', label: 'Stock y Alertas' },
        ]
      },
      { 
        path: '/ventas', 
        label: 'Ventas', 
        icon: ShoppingCart,
        subItems: [
          { path: '/ventas/historial', label: 'Historial de Ventas' },
          { path: '/ventas/nueva', label: 'Nueva Venta' },
          { path: '/ventas/devoluciones', label: 'Devoluciones' },
          { path: '/ventas/comprobantes', label: 'Comprobantes' },
        ]
      },
      { 
        path: '/pagos', 
        label: 'Pagos', 
        icon: CreditCard,
        subItems: [
          { path: '/pagos/registro', label: 'Registro de Pagos' },
          { path: '/pagos/metodos', label: 'Métodos de Pago' },
          { path: '/pagos/comprobantes', label: 'Ver Comprobantes' },
        ]
      },
      { 
        path: '/asistencias', 
        label: 'Asistencias', 
        icon: CalendarCheck,
        subItems: [
          { path: '/asistencias/registro', label: 'Registro de Asistencia' },
          { path: '/asistencias/resumen', label: 'Resumen de Asistencias' },
          { path: '/asistencias/inasistencias', label: 'Inasistencias' },
        ]
      },
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
          { path: '/configuracion/metodos', label: 'Métodos de Pago' },
          { path: '/configuracion/notificaciones', label: 'Notificaciones' },
          { path: '/configuracion/seguridad', label: 'Seguridad' },
        ]
      },
    ]
  }
];