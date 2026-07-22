import { useState, useEffect } from 'react';
import {   Users, CreditCard, Activity, TrendingUp,   ArrowUpRight, ArrowDownRight, Clock, ShieldCheck,   Package, AlertTriangle, PackageOpen } from 'lucide-react';
import {   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,   AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { obtenerUsuarios } from '../../services/usuarios.service';
import { Usuario } from '../../types/usuario';
import { obtenerMembresias } from '../../services/membresias.service';
import { obtenerProductos } from '../../services/productos.service';

const datosIngresos = [
  { name: 'Lun', total: 1200 }, { name: 'Mar', total: 900 },
  { name: 'Mié', total: 1600 }, { name: 'Jue', total: 1400 },
  { name: 'Vie', total: 2100 }, { name: 'Sáb', total: 1800 },
  { name: 'Dom', total: 800 },
];

const datosAsistencias = [
  { time: '06:00', count: 12 }, { time: '09:00', count: 45 },
  { time: '12:00', count: 20 }, { time: '15:00', count: 15 },
  { time: '18:00', count: 65 }, { time: '21:00', count: 40 },
];

const datosMembresiasGrafico = [
  { name: 'Mensual', value: 120, color: '#e6b010' },
  { name: 'Trimestral', value: 80, color: '#f59e0b' },
  { name: 'Anual', value: 48, color: '#fbbf24' },
];

export default function DashboardPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [membresias, setMembresias] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [dataUsuarios, dataMembresias, dataProductos] = await Promise.all([
          obtenerUsuarios({}),
          obtenerMembresias(),
          obtenerProductos()
        ]);
        
        setUsuarios(dataUsuarios.usuarios || dataUsuarios || []);
        setMembresias(dataMembresias.membresias || dataMembresias || []);
        setProductos(dataProductos || []);
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  const totalUsuarios = usuarios.length;
  const administradores = usuarios.filter(u => u.rol === 'ADMIN').length;
  const recientes = [...usuarios].sort((a, b) => {
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  }).slice(0, 5);

  const membresiasActivas = membresias.filter(m => m.estado === 'Activa' || m.estado === 'Activo').length;
  
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const membresiasVencenHoy = membresias.filter(m => {
    if (!m.fechaFin) return false;
    const fechaFin = new Date(m.fechaFin);
    fechaFin.setHours(0, 0, 0, 0);
    return fechaFin.getTime() === hoy.getTime() && (m.estado === 'Activa' || m.estado === 'Activo');
  }).length;

  // Filtrar alertas de stock reales
  const alertasStockReales = productos.filter(p => p.estado === 'Activo' && p.stock <= p.stockMinimo);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-800 p-2.5 rounded-lg shadow-xl">
          <p className="text-gray-300 text-[11px] font-semibold mb-1">{label}</p>
          <p className="text-[#e6b010] font-bold text-xs">
            {payload[0].name === 'total' ? `S/ ${payload[0].value}` : `${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto text-gray-900 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-wide">Resumen General</h1>
          <p className="text-xs text-gray-500 mt-0.5">Métricas principales y rendimiento de TemploGym.</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
          <Clock className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs font-medium text-gray-700">
            {new Date().toLocaleDateString('es-PE', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* INGRESOS */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between group hover:border-[#e6b010]/30 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Ingresos (Mes)</p>
              <h3 className="text-2xl font-bold text-gray-900">S/ 12,450</h3>
            </div>
            <div className="p-2.5 bg-green-50 text-green-600 rounded-lg group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <div className="flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 text-green-500 mr-1" />
              <span className="text-green-600 font-semibold mr-1.5">+14.5%</span>
              <span className="text-gray-400">vs mes ant.</span>
            </div>
            <span className="text-gray-400 font-medium">Meta: 85%</span>
          </div>
        </div>

        {/* MEMBRESÍAS */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between group hover:border-[#e6b010]/30 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Membresías Activas</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {cargando ? '...' : membresiasActivas}
              </h3>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <div className="flex items-center">
              <Activity className="w-3.5 h-3.5 text-blue-500 mr-1" />
              <span className="text-gray-400">Total en sistema</span>
            </div>
            {membresiasVencenHoy > 0 ? (
              <span className="text-red-500 font-medium bg-red-50 px-1.5 py-0.5 rounded">
                {membresiasVencenHoy} vencen hoy
              </span>
            ) : (
              <span className="text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded">
                Ninguna vence hoy
              </span>
            )}
          </div>
        </div>

        {/* PERSONAL */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between group hover:border-[#e6b010]/30 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Personal Registrado</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {cargando ? '...' : totalUsuarios}
              </h3>
            </div>
            <div className="p-2.5 bg-yellow-50 text-[#e6b010] rounded-lg group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <div className="flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 text-[#e6b010] mr-1" />
              <span className="text-gray-700 font-semibold mr-1.5">{administradores}</span>
              <span className="text-gray-400">Admins</span>
            </div>
            <span className="text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded">{totalUsuarios} Activos</span>
          </div>
        </div>

        {/* ALERTAS DE STOCK (AHORA DINÁMICO) */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between group hover:border-[#e6b010]/30 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Alertas de Stock</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {cargando ? '...' : alertasStockReales.length}
              </h3>
            </div>
            <div className="p-2.5 bg-red-50 text-red-500 rounded-lg group-hover:scale-110 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <div className="flex items-center">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 mr-1" />
              <span className="text-red-500 font-semibold">Requieren atención</span>
            </div>
            <span className="text-gray-500 font-medium">Inventario</span>
          </div>
        </div>
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm lg:col-span-2 xl:col-span-2">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-900">Ingresos de la Semana</h3>
            <p className="text-[11px] text-gray-500">Volumen de ventas en soles (S/)</p>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosIngresos} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
                <Bar dataKey="total" fill="#e6b010" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-900">Asistencias Hoy</h3>
            <p className="text-[11px] text-gray-500">Flujo de clientes</p>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={datosAsistencias} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAsistencia" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e6b010" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#e6b010" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" stroke="#e6b010" strokeWidth={2} fillOpacity={1} fill="url(#colorAsistencia)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-gray-900">Planes Activos</h3>
            <p className="text-[11px] text-gray-500">Distribución de membresías</p>
          </div>
          <div className="h-[180px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={datosMembresiasGrafico} innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                  {datosMembresiasGrafico.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-3 mt-auto">
            {datosMembresiasGrafico.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                <span className="text-[10px] font-medium text-gray-600">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TABLA INFERIOR Y ALERTAS REALES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden lg:col-span-2">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-bold text-gray-900">Personal Registrado</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100">
                  <th className="py-2.5 px-4">Usuario</th>
                  <th className="py-2.5 px-4">Cargo</th>
                  <th className="py-2.5 px-4">Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {recientes.length === 0 && !cargando ? (
                  <tr><td colSpan={3} className="p-6 text-center text-gray-500">No hay registros recientes.</td></tr>
                ) : (
                  recientes.map((u) => {
                    const iniciales = `${u.nombres?.charAt(0) ?? u.nombreUsuario?.charAt(0) ?? '?'}${u.apellidos?.charAt(0) ?? ''}`;
                    return (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-2 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-yellow-50 text-[#e6b010] flex items-center justify-center font-bold text-[10px] border border-yellow-100">
                              {iniciales}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{u.nombres || u.apellidos ? `${u.nombres ?? ''} ${u.apellidos ?? ''}`.trim() : u.nombreUsuario}</p>
                              <p className="text-[10px] text-gray-500">@{u.nombreUsuario}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-4 text-gray-600 font-medium">{u.cargo || '---'}</td>
                        <td className="py-2 px-4 text-gray-500">
                          {new Date(u.createdAt || '').toLocaleDateString('es-PE', { month: 'short', day: 'numeric' })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* WIDGET DE ALERTAS DE STOCK REALES */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-bold text-gray-900">Alertas de Stock</h3>
            </div>
            <span className="text-[11px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
              {alertasStockReales.length}
            </span>
          </div>
          <div className="p-2 flex-1 overflow-y-auto max-h-[250px] custom-scrollbar">
            {alertasStockReales.length === 0 && !cargando ? (
              <div className="p-6 text-center text-gray-400 text-xs">
                <PackageOpen className="w-8 h-8 mx-auto mb-2 text-green-500" />
                Todo el inventario está en niveles óptimos.
              </div>
            ) : (
              alertasStockReales.map((alerta) => {
                const esCritico = alerta.stock === 0 || alerta.stock <= (alerta.stockMinimo / 2);
                return (
                  <div key={alerta.id} className="flex items-center justify-between p-2.5 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-md ${esCritico ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{alerta.nombre}</p>
                        <p className="text-[10px] text-gray-500">Quedan: {alerta.stock} und. (Mín: {alerta.stockMinimo})</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${esCritico ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                      {alerta.stock === 0 ? 'Agotado' : 'Bajo'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}