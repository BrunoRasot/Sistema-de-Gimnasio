import { useState, useEffect } from 'react';
import { reportesService } from '../../services/reportes.service';
import { IdCard, Users, Activity, RefreshCw, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#111827', '#e6b010', '#16a34a', '#3b82f6', '#8b5cf6'];

export default function ReportesMembresiasPage() {
  const [metricas, setMetricas] = useState({
    total: 0,
    activos: 0,
    inactivos: 0,
    chartData: []
  });
  const [cargando, setCargando] = useState(true);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const data = await reportesService.obtenerReporteMembresias();
      setMetricas(data);
    } catch (error) {
      toast.error('Error al cargar datos de membresías');
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
          <div className="p-2.5 bg-purple-50 border border-purple-100 rounded-lg text-purple-600">
            <IdCard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">Reporte de Membresías</h1>
            <p className="text-xs text-gray-500 mt-0.5">Métricas sobre clientes y suscripciones activas.</p>
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
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100"><Users className="w-5 h-5 text-gray-900" /></div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{metricas.total}</p>
            <p className="text-[11px] font-medium text-gray-500 mt-0.5 uppercase tracking-wider">Total Clientes</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-lg bg-green-50 border border-green-100"><Activity className="w-5 h-5 text-green-600" /></div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{metricas.activos}</p>
            <p className="text-[11px] font-medium text-gray-500 mt-0.5 uppercase tracking-wider">Membresías Activas</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-lg bg-red-50 border border-red-100"><IdCard className="w-5 h-5 text-red-600" /></div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{metricas.inactivos}</p>
            <p className="text-[11px] font-medium text-gray-500 mt-0.5 uppercase tracking-wider">Clientes Inactivos</p>
          </div>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h3 className="text-sm font-bold text-gray-900 mb-6">Distribución por Planes Activos</h3>
        {cargando ? (
          <div className="h-72 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : metricas.chartData.length === 0 ? (
          <div className="h-72 flex items-center justify-center text-gray-400 text-sm">No hay planes activos para graficar.</div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={metricas.chartData} innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                  {metricas.chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
