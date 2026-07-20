import { useState, useEffect } from 'react';
import { 
  ShieldAlert, Save, RefreshCw, ChevronRight, 
  LayoutDashboard, IdCard, User, Package, ShoppingCart, 
  CreditCard, CalendarCheck, BarChart3, Settings, Shield, Lock
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
type Accion = typeof acciones[number];

const permisosIniciales: Record<string, Record<string, Record<Accion, boolean>>> = {};
cargos.forEach(cargo => {
  permisosIniciales[cargo] = {};
  modulosSistema.forEach(mod => {
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
          setPermisos(prev => {
            const nuevoEstado = JSON.parse(JSON.stringify(prev));
            datosBD.forEach((p: any) => {
              if (nuevoEstado[p.cargo] && nuevoEstado[p.cargo][p.modulo]) {
                nuevoEstado[p.cargo][p.modulo] = {
                  Ver: p.ver, Crear: p.crear, Editar: p.editar, Eliminar: p.eliminar
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

    setPermisos(prev => ({
      ...prev,
      [cargoSeleccionado]: {
        ...prev[cargoSeleccionado],
        [moduloId]: {
          ...prev[cargoSeleccionado][moduloId],
          [accion]: !prev[cargoSeleccionado][moduloId][accion]
        }
      }
    }));
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await guardarPermisosBD(cargoSeleccionado, permisos[cargoSeleccionado]);
      toast.success(`Permisos para el cargo "${cargoSeleccionado}" guardados exitosamente.`);
    } catch (error) {
      toast.error("Hubo un error al guardar los permisos en la base de datos.");
    } finally {
      setGuardando(false);
    }
  };

  const CustomToggle = ({ activo, disabled, onClick }: { activo: boolean, disabled?: boolean, onClick: () => void }) => (
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
    return <div className="text-gray-600 p-6 flex items-center gap-2"><RefreshCw className="animate-spin w-5 h-5"/> Cargando configuración...</div>;
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto text-gray-900">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-100">
            <ShieldAlert className="w-6 h-6 text-[#e6b010]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-wide">Roles y Permisos</h1>
            <p className="text-sm text-gray-500 mt-1">Configura el nivel de acceso a los módulos según el cargo del trabajador.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleGuardar} 
            disabled={guardando || cargoSeleccionado === 'Administrador'}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#e6b010] hover:bg-[#d4a00e] text-white font-bold rounded-xl text-sm transition-all shadow-md disabled:opacity-50 disabled:hover:shadow-none hover:-translate-y-0.5 active:translate-y-0"
          >
            {guardando ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {guardando ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/4 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Selecciona un Cargo</h3>
            </div>
            <div className="flex flex-col py-2">
              {cargos.map(cargo => {
                const isActive = cargoSeleccionado === cargo;
                return (
                  <button
                    key={cargo}
                    onClick={() => setCargoSeleccionado(cargo)}
                    className={`flex items-center justify-between w-full px-5 py-3 transition-all text-sm font-medium relative ${
                      isActive 
                      ? 'text-yellow-700 bg-yellow-50' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#e6b010] rounded-r-full"></div>}
                    <div className="flex items-center gap-3">
                      <Shield className={`w-4 h-4 ${isActive ? 'text-[#e6b010]' : 'text-gray-400'}`} />
                      {cargo}
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 items-start shadow-sm">
            <div className="p-1.5 bg-blue-100 rounded-md">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xs text-blue-800 leading-relaxed">
              Los usuarios con rol <span className="font-bold">ADMIN</span> ignoran esta matriz, ya que cuentan con acceso irrestricto al sistema.
            </p>
          </div>
        </div>

        <div className="lg:w-3/4 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col">
          <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                Permisos para: <span className="text-yellow-700 bg-yellow-100 px-3 py-1 rounded-lg border border-yellow-200">{cargoSeleccionado}</span>
              </h3>
              {cargoSeleccionado === 'Administrador' && (
                <p className="text-[13px] text-gray-500 mt-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                  Este cargo tiene acceso total. Los permisos están bloqueados.
                </p>
              )}
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar flex-1 p-2">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr>
                  <th className="py-3 px-4 pl-6 text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100">
                    Módulo del Sistema
                  </th>
                  {acciones.map(accion => (
                    <th key={accion} className="py-3 px-4 text-center text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100">
                      {accion}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm">
                {modulosSistema.map((modulo) => {
                  let overridesAdmin = cargoSeleccionado === 'Administrador' ? { Ver: true, Crear: true, Editar: true, Eliminar: true } : permisos[cargoSeleccionado][modulo.id];

                  return (
                    <tr key={modulo.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group">
                      <td className="py-2.5 px-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-500 group-hover:text-[#e6b010] group-hover:bg-yellow-50 transition-colors">
                            <modulo.icon className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-gray-700">{modulo.nombre}</span>
                        </div>
                      </td>
                      {acciones.map(accion => {
                        const tienePermiso = overridesAdmin[accion];
                        const esAdmin = cargoSeleccionado === 'Administrador';
                        
                        return (
                          <td key={accion} className="py-2.5 px-4 text-center align-middle">
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