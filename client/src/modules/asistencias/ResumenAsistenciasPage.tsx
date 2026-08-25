import { useState, useEffect, useMemo } from 'react';
import { obtenerAsistenciasHoy } from '../../services/asistencias.service';
import { CalendarCheck, Search, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResumenAsistenciasPage() {
  const [asistencias, setAsistencias] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const data = await obtenerAsistenciasHoy();
      setAsistencias(data);
    } catch (error) {
      console.error("Error al cargar las asistencias", error);
      toast.error('Error al cargar los registros de asistencia');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const asistenciasFiltradas = useMemo(() => {
    const term = busqueda.trim().toLowerCase();
    if (!term) return asistencias;
    return asistencias.filter((item) => {
      const texto = `${item.miembro.nombres} ${item.miembro.apellidos} ${item.miembro.dni}`.toLowerCase();
      return texto.includes(term);
    });
  }, [asistencias, busqueda]);

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-4">

      <div className="module-header bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-yellow-50 border border-yellow-100 rounded-lg text-yellow-600">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">Resumen de Asistencias</h1>
            <p className="text-xs text-gray-500 mt-0.5">Control y seguimiento de todos los ingresos registrados hoy.</p>
          </div>
        </div>
        <button
          onClick={cargarDatos}
          className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
          title="Actualizar"
        >
          <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Buscar por código, cliente, concepto o método..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-1 outline-none text-sm text-gray-900 placeholder-gray-400 bg-transparent"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white border-b border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                <th className="py-3 px-6">Cliente</th>
                <th className="py-3 px-6">Identificación</th>
                <th className="py-3 px-6">Hora</th>
                <th className="py-3 px-6">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
              {cargando ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500">
                    Cargando registros...
                  </td>
                </tr>
              ) : asistenciasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500">
                    No se encontraron registros de asistencia.
                  </td>
                </tr>
              ) : (
                asistenciasFiltradas.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-medium text-gray-900">
                      {`${item.miembro.nombres} ${item.miembro.apellidos}`.trim()}
                    </td>
                    <td className="py-3.5 px-6">
                      {item.miembro.dni}
                    </td>
                    <td className="py-3.5 px-6">
                      {new Date(item.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="text-gray-900 font-medium">Registrado</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
