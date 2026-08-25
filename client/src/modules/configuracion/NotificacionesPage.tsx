import { useState, useEffect } from 'react';
import { configuracionService } from '../../services/configuracion.service';
import { Bell, Save, Mail, Monitor } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificacionesPage() {
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [config, setConfig] = useState({
    emailNotificaciones: '',
    nuevasVentas: true,
    membresiasVencidas: true,
    stockBajo: true,
    alertasSistema: false,
    reportesSemanales: true
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const data = await configuracionService.obtenerDatos();
        if (data) {
          setConfig({
            emailNotificaciones: data.emailNotificaciones || '',
            nuevasVentas: data.nuevasVentas ?? true,
            membresiasVencidas: data.membresiasVencidas ?? true,
            stockBajo: data.stockBajo ?? true,
            alertasSistema: data.alertasSistema ?? false,
            reportesSemanales: data.reportesSemanales ?? true
          });
        }
      } catch (error) {
        toast.error('Error al cargar preferencias de notificación');
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  const toggleAlerta = (key: keyof typeof config) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setGuardando(true);
    try {
      await configuracionService.actualizarNotificaciones(config);
      toast.success('Preferencias de notificaciones guardadas');
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar las notificaciones');
    } finally {
      setGuardando(false);
    }
  };

  const ToggleSwitch = ({ id, label, description, checked }: { id: keyof typeof config, label: string, description: string, checked: boolean }) => (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0">
      <div className="pr-4">
        <p className="text-sm font-bold text-gray-900">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => toggleAlerta(id)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-blue-600' : 'bg-gray-200'
          }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${checked ? 'translate-x-6' : 'translate-x-1'
            }`}
        />
      </button>
    </div>
  );

  if (cargando) return <div className="p-8 text-center text-gray-500 text-sm">Cargando preferencias...</div>;

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-6">

      <div className="module-header flex items-center justify-between rounded-xl border border-yellow-200/80 p-4 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Centro de Notificaciones</h1>
          <p className="text-xs text-gray-500 mt-0.5">Configure los canales de recepción y los eventos prioritarios del sistema.</p>
        </div>
        <div className="p-2.5 bg-yellow-50 border border-yellow-200 rounded-lg text-[#c89500] shadow-sm">
          <Bell className="w-5 h-5" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Canales de Entrega Activos</h2>
            <p className="text-xs text-gray-500 mt-0.5">Las alertas seleccionadas abajo se procesarán a través de los siguientes medios:</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
              <div className="p-2 bg-white border border-gray-200 rounded-lg text-blue-600 shadow-sm">
                <Monitor className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Campanita (In-App)</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Avisos visuales instantáneos en la interfaz.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
              <div className="p-2 bg-white border border-gray-200 rounded-lg text-blue-600 shadow-sm">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Correo Electrónico</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Envío automatizado vía NodeMailer.</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Correo de Destino del Administrador</label>
            <input
              type="email"
              placeholder="admin@gimnasio.com"
              value={config.emailNotificaciones}
              onChange={(e) => setConfig({ ...config, emailNotificaciones: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl py-3 px-3.5 text-sm text-gray-900 placeholder:text-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
            />
            <p className="text-[11px] text-gray-400">A esta dirección llegarán los reportes semanales y avisos críticos de inventario.</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-6 border-b border-gray-100 bg-gray-50/40">
              <h2 className="text-sm font-bold text-gray-900">Eventos a Notificar</h2>
              <p className="text-xs text-gray-500 mt-0.5">Active o desactive los eventos que ameriten una alerta formal.</p>
            </div>

            <div className="px-6 py-2">
              <ToggleSwitch
                id="nuevasVentas"
                label="Nuevas Ventas o Pagos"
                description="Notificar cada vez que se registre una membresía o venta."
                checked={config.nuevasVentas}
              />
              <ToggleSwitch
                id="membresiasVencidas"
                label="Membresías por Vencer"
                description="Avisar con anticipación sobre clientes próximos a expirar."
                checked={config.membresiasVencidas}
              />
              <ToggleSwitch
                id="stockBajo"
                label="Alertas de Inventario Crítico"
                description="Avisar cuando un producto alcance su límite mínimo de stock."
                checked={config.stockBajo}
              />
              <ToggleSwitch
                id="reportesSemanales"
                label="Resumen Semanal de Rendimiento"
                description="Recopilar métricas de ingresos y asistencias."
                checked={config.reportesSemanales}
              />
              <ToggleSwitch
                id="alertasSistema"
                label="Actualizaciones y Mantenimiento"
                description="Avisos sobre mejoras o tareas programadas."
                checked={config.alertasSistema}
              />
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50/60 border-t border-gray-100 flex justify-end mt-4">
            <button
              onClick={handleSave}
              disabled={guardando}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
