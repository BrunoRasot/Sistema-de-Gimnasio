import { useState, useEffect } from 'react';
import { reportesService } from '../../services/reportes.service';
import { Package, AlertTriangle, DollarSign, RefreshCw, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export default function ReportesInventarioPage() {
  const [metricas, setMetricas] = useState({
    total: 0,
    valorTotal: 0,
    bajoStockCount: 0,
    chartData: []
  });
  const [cargando, setCargando] = useState(true);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const data = await reportesService.obtenerReporteInventario();
      setMetricas(data);
    } catch (error) {
      toast.error('Error al cargar datos de inventario');
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
          <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">Reporte de Inventario</h1>
            <p className="text-xs text-gray-500 mt-0.5">Valorización y estado actual de los productos.</p>
          </div>
        </div>
        <button
          onClick={cargarDatos}
          className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100"><Package className="w-5 h-5 text-gray-900" /></div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{metricas.total}</p>
            <p className="text-[11px] font-medium text-gray-500 mt-0.5 uppercase tracking-wider">Productos Registrados</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-lg bg-green-50 border border-green-100"><DollarSign className="w-5 h-5 text-green-600" /></div>
          <div>
            <p className="text-2xl font-bold text-gray-900">S/ {metricas.valorTotal.toFixed(2)}</p>
            <p className="text-[11px] font-medium text-gray-500 mt-0.5 uppercase tracking-wider">Valor Estimado (Venta)</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-lg bg-red-50 border border-red-100"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{metricas.bajoStockCount}</p>
            <p className="text-[11px] font-medium text-gray-500 mt-0.5 uppercase tracking-wider">Bajo / Sin Stock</p>
          </div>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h3 className="text-sm font-bold text-gray-900 mb-6">Top 5 - Valor Retenido en Stock (S/)</h3>
        {cargando ? (
          <div className="h-72 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : metricas.chartData.length === 0 ? (
          <div className="h-72 flex items-center justify-center text-gray-400 text-sm">No hay inventario para analizar.</div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricas.chartData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis dataKey="nombre" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#111827', fontWeight: 500 }} width={120} />
                <Tooltip
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                  formatter={(value) => [`S/ ${value}`, 'Valor']}
                />
                <Bar dataKey="valorStock" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
