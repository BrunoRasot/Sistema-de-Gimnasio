import { useState, useEffect } from 'react';
import { reportesService } from '../../services/reportes.service';
import { BarChart3, TrendingUp, CreditCard, RefreshCw, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export default function ReportesVentasPage() {
  const [metricas, setMetricas] = useState({
    ingresosTotales: 0,
    ventasCompletadas: 0,
    ticketPromedio: 0,
    chartData: []
  });
  const [cargando, setCargando] = useState(true);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const data = await reportesService.obtenerReporteVentas();
      setMetricas(data);
    } catch (error) {
      toast.error('Error al cargar datos de ventas');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-4">
      {/* 1. Header Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-lg text-blue-600">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">Reporte de Ventas</h1>
            <p className="text-xs text-gray-500 mt-0.5">Análisis de ingresos y transacciones monetarias.</p>
          </div>
        </div>
        <button 
          onClick={cargarDatos} 
          className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 2. Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-lg bg-green-50 border border-green-100"><TrendingUp className="w-5 h-5 text-green-600" /></div>
          <div>
            <p className="text-2xl font-bold text-gray-900">S/ {metricas.ingresosTotales.toFixed(2)}</p>
            <p className="text-[11px] font-medium text-gray-500 mt-0.5 uppercase tracking-wider">Ingresos Totales</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100"><CreditCard className="w-5 h-5 text-blue-600" /></div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{metricas.ventasCompletadas}</p>
            <p className="text-[11px] font-medium text-gray-500 mt-0.5 uppercase tracking-wider">Ventas Exitosas</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-100"><BarChart3 className="w-5 h-5 text-yellow-600" /></div>
          <div>
            <p className="text-2xl font-bold text-gray-900">S/ {metricas.ticketPromedio.toFixed(2)}</p>
            <p className="text-[11px] font-medium text-gray-500 mt-0.5 uppercase tracking-wider">Ticket Promedio</p>
          </div>
        </div>
      </div>

      {/* 3. Gráfico */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h3 className="text-sm font-bold text-gray-900 mb-6">Evolución de Ingresos</h3>
        {cargando ? (
          <div className="h-72 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metricas.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="fecha" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} dx={-10} tickFormatter={(val) => `S/${val}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
                />
                <Line type="monotone" dataKey="ingresos" stroke="#111827" strokeWidth={3} dot={{ r: 4, fill: '#111827', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}