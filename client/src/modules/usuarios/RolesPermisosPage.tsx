import { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Save,
  RefreshCw,
  ChevronRight,
  LayoutDashboard,
  IdCard,
  User,
  Package,
  ShoppingCart,
  CreditCard,
  CalendarCheck,
  BarChart3,
  Settings,
  Shield,
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { obtenerPermisosBD, guardarPermisosBD } from '../../services/permisos.service';

const cargos = ['Administrador', 'Supervisor', 'Recepcionista', 'Cajero', 'Entrenador', 'Almacén'];

const modulosSistema = [
  { id: 'dashboard', nombre: 'Dashboard', icon: LayoutDashboard },
  { id: 'membresias', nombre: 'Membresías', icon: IdCard },
  { id: 'usuarios', nombre: 'Usuarios', icon: User },
  { id: 'productos', nombre: 'Productos (Inventario)', icon: Package },
  { id: 'ventas', nombre: 'Ventas', icon: ShoppingCart },
  { id: 'pagos', nombre: 'Pagos', icon: CreditCard },
  { id: 'asistencias', nombre: 'Asistencias', icon: CalendarCheck },
  { id: 'reportes', nombre: 'Reportes', icon: BarChart3 },
  { id: 'configuracion', nombre: 'Configuración', icon: Settings },
];

const acciones = ['Ver', 'Crear', 'Editar', 'Eliminar'] as const;
type Accion = (typeof acciones)[number];

const permisosIniciales: Record<string, Record<string, Record<Accion, boolean>>> = {};
cargos.forEach((cargo) => {
  permisosIniciales[cargo] = {};
  modulosSistema.forEach((mod) => {
    permisosIniciales[cargo][mod.id] = { Ver: false, Crear: false, Editar: false, Eliminar: false };
  });
});

export default function RolesPermisosPage() {
  const [cargoSeleccionado, setCargoSeleccionado] = useState<string>(cargos[1]);
  const [permisos, setPermisos] = useState(permisosIniciales);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchPermisos = async () => {
      try {
        const datosBD = await obtenerPermisosBD();
        if (datosBD && datosBD.length > 0) {
          setPermisos((prev) => {
            const nuevoEstado = JSON.parse(JSON.stringify(prev));
            datosBD.forEach((p: any) => {
              if (nuevoEstado[p.cargo] && nuevoEstado[p.cargo][p.modulo]) {
                nuevoEstado[p.cargo][p.modulo] = {
                  Ver: p.ver,
                  Crear: p.crear,
                  Editar: p.editar,
                  Eliminar: p.eliminar,
                };
              }
            });
            return nuevoEstado;
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setCargando(false);
      }
    };
    fetchPermisos();
  }, []);

  const togglePermiso = (moduloId: string, accion: Accion) => {
    if (cargoSeleccionado === 'Administrador') return;

    setPermisos((prev) => ({
      ...prev,
      [cargoSeleccionado]: {
        ...prev[cargoSeleccionado],
        [moduloId]: {
          ...prev[cargoSeleccionado][moduloId],
          [accion]: !prev[cargoSeleccionado][moduloId][accion],
        },
      },
    }));
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await guardarPermisosBD({
        cargo: cargoSeleccionado,
        permisos: permisos[cargoSeleccionado],
      });
      toast.success(`Permisos para el cargo "${cargoSeleccionado}" guardados exitosamente.`);
    } catch (error: any) {
      toast.error(
        error.response?.data?.mensaje ||
          'Hubo un error al guardar los permisos en la base de datos.',
      );
    } finally {
      setGuardando(false);
    }
  };

  const CustomToggle = ({
    activo,
    disabled,
    onClick,
  }: {
    activo: boolean;
    disabled?: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`relative inline-flex h-4 w-8 items-center rounded-full transition-all duration-300 focus:outline-none shadow-inner border border-gray-200 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${activo ? 'bg-[#e6b010]' : 'bg-gray-200'}`}
    >
      <span
        className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${
          activo ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  );

  if (cargando) {
    return (
      <div className="text-gray-600 p-6 flex items-center gap-2">
        <RefreshCw className="animate-spin w-5 h-5" /> Cargando configuración...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-4 text-gray-900">
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 bg-yellow-50 rounded-lg border border-yellow-100 text-[#e6b010]">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 tracking-wide">Roles y Permisos</h1>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Configura el nivel de acceso a los módulos según el cargo del trabajador.
            </p>
          </div>
        </div>
        <button
          onClick={handleGuardar}
          disabled={guardando || cargoSeleccionado === 'Administrador'}
          className="w-full sm:w-auto px-4 py-2 bg-[#141414] hover:bg-black text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
        >
          {guardando ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          {guardando ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-1/4 flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-3.5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Selecciona un Cargo
              </h3>
            </div>
            <div className="flex flex-col py-1">
              {cargos.map((cargo) => {
                const isActive = cargoSeleccionado === cargo;
                return (
                  <button
                    key={cargo}
                    onClick={() => setCargoSeleccionado(cargo)}
                    className={`flex items-center justify-between w-full px-4 py-2.5 transition-all text-xs font-medium relative ${
                      isActive
                        ? 'text-gray-900 bg-yellow-50/60 font-bold'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#e6b010] rounded-r-full"></div>
                    )}
                    <div className="flex items-center gap-2.5">
                      <Shield
                        className={`w-3.5 h-3.5 ${isActive ? 'text-[#e6b010]' : 'text-gray-400'}`}
                      />
                      {cargo}
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 flex gap-2.5 items-start shadow-sm">
            <div className="p-1 bg-blue-100 rounded-md shrink-0">
              <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <p className="text-[11px] text-blue-900 leading-relaxed">
              Los usuarios con rol <span className="font-bold">ADMIN</span> ignoran esta matriz, ya
              que cuentan con acceso irrestricto al sistema.
            </p>
          </div>
        </div>

        <div className="lg:w-3/4 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden min-h-[400px]">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-2">
                Permisos para:{' '}
                <span className="text-gray-900 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200 normal-case font-bold">
                  {cargoSeleccionado}
                </span>
              </h3>
              {cargoSeleccionado === 'Administrador' && (
                <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-gray-400" />
                  Este cargo tiene acceso total. Los permisos están bloqueados.
                </p>
              )}
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar flex-1">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                  <th className="py-3 px-4 pl-5">Módulo del Sistema</th>
                  {acciones.map((accion) => (
                    <th key={accion} className="py-3 px-4 text-center">
                      {accion}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-gray-100">
                {modulosSistema.map((modulo) => {
                  let overridesAdmin =
                    cargoSeleccionado === 'Administrador'
                      ? { Ver: true, Crear: true, Editar: true, Eliminar: true }
                      : permisos[cargoSeleccionado][modulo.id];

                  return (
                    <tr key={modulo.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-3 px-4 pl-5">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1 rounded-md bg-gray-100 border border-gray-200 text-gray-500 group-hover:text-[#e6b010] group-hover:bg-yellow-50 transition-colors">
                            <modulo.icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-bold text-gray-900">{modulo.nombre}</span>
                        </div>
                      </td>
                      {acciones.map((accion) => {
                        const tienePermiso = overridesAdmin[accion];
                        const esAdmin = cargoSeleccionado === 'Administrador';

                        return (
                          <td key={accion} className="py-3 px-4 text-center align-middle">
                            <div className="flex items-center justify-center">
                              <CustomToggle
                                activo={tienePermiso}
                                disabled={esAdmin}
                                onClick={() => togglePermiso(modulo.id, accion)}
                              />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
