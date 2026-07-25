import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import LoginPage from '../pages/Login/LoginPage';
import DashboardPage from '../pages/Dashboard/DashboardPage';

// Importaciones de todos los submódulos
import PlanesPage from '../modules/membresias/PlanesPage';
import ClientesPage from '../modules/membresias/ClientesPage';
import MiembrosActivosPage from '../modules/membresias/MiembrosActivosPage';
import MembresiasVencidasPage from '../modules/membresias/MembresiasVencidasPage';
import RenovacionesPage from '../modules/membresias/RenovacionesPage';

import ListaUsuariosPage from '../modules/usuarios/ListaUsuariosPage';
import RolesPermisosPage from '../modules/usuarios/RolesPermisosPage';
import AdministradoresPage from '../modules/usuarios/AdministradoresPage';

import InventarioPage from '../modules/productos/InventarioPage';
import CategoriasPage from '../modules/productos/CategoriasPage'; 
import ProveedoresPage from '../modules/productos/ProveedoresPage';
import StockAlertasPage from '../modules/productos/StockAlertasPage';

import HistorialVentasPage from '../modules/ventas/HistorialVentasPage';
import NuevaVentaPage from '../modules/ventas/NuevaVentaPage';
import DevolucionesPage from '../modules/ventas/DevolucionesPage';
import ComprobantesVentasPage from '../modules/ventas/ComprobantesVentasPage';

import RegistroPagosPage from '../modules/pagos/RegistroPagosPage';
import MetodosPagoPage from '../modules/pagos/MetodosPagoPage';

import RegistroAsistenciaPage from '../modules/asistencias/RegistroAsistenciaPage';
import ResumenAsistenciasPage from '../modules/asistencias/ResumenAsistenciasPage';
import InasistenciasPage from '../modules/asistencias/InasistenciasPage';

import ReportesVentasPage from '../modules/reportes/ReportesVentasPage';
import ReportesMembresiasPage from '../modules/reportes/ReportesMembresiasPage';
import ReportesAsistenciasPage from '../modules/reportes/ReportesAsistenciasPage';
import ReportesInventarioPage from '../modules/reportes/ReportesInventarioPage';

import InfoGimnasioPage from '../modules/configuracion/InfoGimnasioPage';
import ConfigMetodosPagoPage from '../modules/configuracion/ConfigMetodosPagoPage';
import NotificacionesPage from '../modules/configuracion/NotificacionesPage';
import SeguridadPage from '../modules/configuracion/SeguridadPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Default redirect si acceden a la raiz del dashboard */}
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
          <Route path="/asistencias/inasistencias" element={<InasistenciasPage />} />

          {/* Submódulos Reportes */}
          <Route path="/reportes" element={<Navigate to="/reportes/ventas" replace />} />
          <Route path="/reportes/ventas" element={<ReportesVentasPage />} />
          <Route path="/reportes/membresias" element={<ReportesMembresiasPage />} />
          <Route path="/reportes/asistencias" element={<ReportesAsistenciasPage />} />
          <Route path="/reportes/inventario" element={<ReportesInventarioPage />} />

          {/* Submódulos Configuración */}
          <Route path="/configuracion" element={<Navigate to="/configuracion/info" replace />} />
          <Route path="/configuracion/info" element={<InfoGimnasioPage />} />
          <Route path="/configuracion/metodos" element={<ConfigMetodosPagoPage />} />
          <Route path="/configuracion/notificaciones" element={<NotificacionesPage />} />
          <Route path="/configuracion/seguridad" element={<SeguridadPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;