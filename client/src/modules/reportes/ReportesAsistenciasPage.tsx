import { useState, useEffect } from 'react';
import { reportesService } from '../../services/reportes.service';
import { CalendarCheck, Clock, Users, RefreshCw, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export default function ReportesAsistenciasPage() {
  const [metricas, setMetricas] = useState({
    total: 0,
    picoHora: '--:--',
    chartData: []
  });
  const [cargando, setCargando] = useState(true);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const data = await reportesService.obtenerReporteAsistencias();
      setMetricas(data);
    } catch (error) {
      toast.error('Error al cargar datos de asistencias');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-4">
      <div className="module-header bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-yellow-50 border border-yellow-100 rounded-lg text-yellow-600">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">Reporte de Afluencia</h1>
            <p className="text-xs text-gray-500 mt-0.5">Análisis de los ingresos registrados durante el día.</p>
          </div>
        </div>
        <button
          onClick={cargarDatos}
          className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100"><Users className="w-5 h-5 text-gray-900" /></div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{metricas.total}</p>
            <p className="text-[11px] font-medium text-gray-500 mt-0.5 uppercase tracking-wider">Ingresos Totales Hoy</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-100"><Clock className="w-5 h-5 text-yellow-600" /></div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{metricas.picoHora}</p>
            <p className="text-[11px] font-medium text-gray-500 mt-0.5 uppercase tracking-wider">Hora Pico de Afluencia</p>
          </div>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h3 className="text-sm font-bold text-gray-900 mb-6">Asistencias por Hora</h3>
        {cargando ? (
          <div className="h-72 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : metricas.chartData.length === 0 ? (
          <div className="h-72 flex items-center justify-center text-gray-400 text-sm">Aún no hay asistencias registradas hoy.</div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricas.chartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="hora" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                />
                <Bar dataKey="ingresos" fill="#111827" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
