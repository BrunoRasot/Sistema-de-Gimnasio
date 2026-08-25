import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { tokenService } from '../services/token.service';
import { api } from '../services/api';

import { ProtectedRoute } from './ProtectedRoute';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
const LoginPage = lazy(() => import('../modules/auth/LoginPage'));
const DashboardPage = lazy(() => import('../modules/dashboard/DashboardPage'));
const PlanesPage = lazy(() => import('../modules/membresias/PlanesPage'));
const ClientesPage = lazy(() => import('../modules/membresias/ClientesPage'));
const MiembrosActivosPage = lazy(() => import('../modules/membresias/MiembrosActivosPage'));
const MembresiasVencidasPage = lazy(() => import('../modules/membresias/MembresiasVencidasPage'));
const RenovacionesPage = lazy(() => import('../modules/membresias/RenovacionesPage'));
const ListaUsuariosPage = lazy(() => import('../modules/usuarios/ListaUsuariosPage'));
const RolesPermisosPage = lazy(() => import('../modules/usuarios/RolesPermisosPage'));
const AdministradoresPage = lazy(() => import('../modules/usuarios/AdministradoresPage'));
const InventarioPage = lazy(() => import('../modules/productos/InventarioPage'));
const CategoriasPage = lazy(() => import('../modules/productos/CategoriasPage'));
const ProveedoresPage = lazy(() => import('../modules/productos/ProveedoresPage'));
const StockAlertasPage = lazy(() => import('../modules/productos/StockAlertasPage'));
const HistorialVentasPage = lazy(() => import('../modules/ventas/HistorialVentasPage'));
const NuevaVentaPage = lazy(() => import('../modules/ventas/NuevaVentaPage'));
const DevolucionesPage = lazy(() => import('../modules/ventas/DevolucionesPage'));
const ComprobantesVentasPage = lazy(() => import('../modules/ventas/ComprobantesVentasPage'));
const RegistroPagosPage = lazy(() => import('../modules/pagos/RegistroPagosPage'));
const MetodosPagoPage = lazy(() => import('../modules/pagos/MetodosPagoPage'));
const RegistroAsistenciaPage = lazy(() => import('../modules/asistencias/RegistroAsistenciaPage'));
const ResumenAsistenciasPage = lazy(() => import('../modules/asistencias/ResumenAsistenciasPage'));
const ReportesVentasPage = lazy(() => import('../modules/reportes/ReportesVentasPage'));
const ReportesMembresiasPage = lazy(() => import('../modules/reportes/ReportesMembresiasPage'));
const ReportesAsistenciasPage = lazy(() => import('../modules/reportes/ReportesAsistenciasPage'));
const ReportesInventarioPage = lazy(() => import('../modules/reportes/ReportesInventarioPage'));
const InfoGimnasioPage = lazy(() => import('../modules/configuracion/InfoGimnasioPage'));
const NotificacionesPage = lazy(() => import('../modules/configuracion/NotificacionesPage'));
const SeguridadPage = lazy(() => import('../modules/configuracion/SeguridadPage'));

const AppInitializer = ({ children }: { children: React.ReactNode }) => {
  const [cargandoSesion, setCargandoSesion] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const restaurarSesion = async () => {
      try {
        const { data } = await api.post('/auth/refresh-token');
        if (data?.token && isMounted) {
          tokenService.setAccessToken(data.token);
          if (data.usuario) {
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            localStorage.setItem('usuarioRol', data.usuario.rol || 'USER');
            localStorage.setItem('usuarioCargo', data.usuario.cargo || '');
          }
        }
      } catch (error) {
        tokenService.clearAccessToken();
      } finally {
        if (isMounted) {
          setCargandoSesion(false);
        }
      }
    };

    restaurarSesion();

    return () => {
      isMounted = false;
    };
  }, []);

  if (cargandoSesion) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0a0a0a] text-amber-400">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-xs font-medium tracking-wider text-gray-400 uppercase">
            Cargando sistema...
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <AppInitializer>
      <Suspense fallback={<div className="p-6 text-sm text-gray-500">Cargando módulo...</div>}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Submódulos Membresías */}
            <Route path="/membresias" element={<Navigate to="/membresias/planes" replace />} />
            <Route path="/membresias/clientes" element={<ClientesPage />} />
            <Route path="/membresias/planes" element={<PlanesPage />} />
            <Route path="/membresias/activos" element={<MiembrosActivosPage />} />
            <Route path="/membresias/vencidas" element={<MembresiasVencidasPage />} />
            <Route path="/membresias/renovaciones" element={<RenovacionesPage />} />

            {/* Submódulos Usuarios */}
            <Route path="/usuarios" element={<Navigate to="/usuarios/lista" replace />} />
            <Route path="/usuarios/lista" element={<ListaUsuariosPage />} />
            <Route path="/usuarios/roles" element={<RolesPermisosPage />} />
            <Route path="/usuarios/administradores" element={<AdministradoresPage />} />

            {/* Submódulos Productos */}
            <Route path="/productos" element={<Navigate to="/productos/inventario" replace />} />
            <Route path="/productos/inventario" element={<InventarioPage />} />
            <Route path="/productos/categorias" element={<CategoriasPage />} />
            <Route path="/productos/proveedores" element={<ProveedoresPage />} />
            <Route path="/productos/alertas" element={<StockAlertasPage />} />

            {/* Submódulos Ventas */}
            <Route path="/ventas" element={<Navigate to="/ventas/historial" replace />} />
            <Route path="/ventas/historial" element={<HistorialVentasPage />} />
            <Route path="/ventas/nueva" element={<NuevaVentaPage />} />
            <Route path="/ventas/devoluciones" element={<DevolucionesPage />} />
            <Route path="/ventas/comprobantes" element={<ComprobantesVentasPage />} />

            {/* Submódulos Pagos */}
            <Route path="/pagos" element={<Navigate to="/pagos/registro" replace />} />
            <Route path="/pagos/registro" element={<RegistroPagosPage />} />
            <Route path="/pagos/metodos" element={<MetodosPagoPage />} />

            {/* Submódulos Asistencias */}
            <Route path="/asistencias" element={<Navigate to="/asistencias/registro" replace />} />
            <Route path="/asistencias/registro" element={<RegistroAsistenciaPage />} />
            <Route path="/asistencias/resumen" element={<ResumenAsistenciasPage />} />

            {/* Submódulos Reportes */}
            <Route path="/reportes" element={<Navigate to="/reportes/ventas" replace />} />
            <Route path="/reportes/ventas" element={<ReportesVentasPage />} />
            <Route path="/reportes/membresias" element={<ReportesMembresiasPage />} />
            <Route path="/reportes/asistencias" element={<ReportesAsistenciasPage />} />
            <Route path="/reportes/inventario" element={<ReportesInventarioPage />} />

            {/* Submódulos Configuración */}
            <Route path="/configuracion" element={<Navigate to="/configuracion/info" replace />} />
            <Route path="/configuracion/info" element={<InfoGimnasioPage />} />
            <Route path="/configuracion/notificaciones" element={<NotificacionesPage />} />
            <Route path="/configuracion/seguridad" element={<SeguridadPage />} />
          </Route>
        </Route>
      </Routes>
      </Suspense>
    </AppInitializer>
  );
};

export default AppRoutes;
