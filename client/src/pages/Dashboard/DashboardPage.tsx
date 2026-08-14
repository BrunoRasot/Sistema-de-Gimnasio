import { useState, useEffect } from 'react';
import { Users, Activity, TrendingUp, ArrowUpRight, Clock, ShieldCheck, Package, AlertTriangle, PackageOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { obtenerUsuarios } from '../../services/usuarios.service';
import { Usuario } from '../../types/usuario';
import { obtenerMembresias } from '../../services/membresias.service';
import { obtenerProductos } from '../../services/productos.service';
import { reportesService } from '../../services/reportes.service';
import { ventasService } from '../../services/ventas.service';

const COLORES_PLANES = ['#e6b010', '#f59e0b', '#fbbf24', '#d97706', '#b45309'];

export default function DashboardPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [membresias, setMembresias] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  const [datosIngresos, setDatosIngresos] = useState<{ name: string; total: number }[]>([]);
  const [datosAsistencias, setDatosAsistencias] = useState<{ time: string; count: number }[]>([]);
  const [datosMembresiasGrafico, setDatosMembresiasGrafico] = useState<{ name: string; value: number; color: string }[]>([]);
  const [ingresosMes, setIngresosMes] = useState(0);
  const [variacionMes, setVariacionMes] = useState<number | null>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [dataUsuarios, dataMembresias, dataProductos, repVentas, repAsistencias, repMembresias, todasVentas] = await Promise.all([
          obtenerUsuarios({}),
          obtenerMembresias(),
          obtenerProductos(),
          reportesService.obtenerReporteVentas(),
          reportesService.obtenerReporteAsistencias(),
          reportesService.obtenerReporteMembresias(),
          ventasService.obtenerVentas(),
        ]);

        setUsuarios(dataUsuarios.usuarios || dataUsuarios || []);
        setMembresias(dataMembresias.membresias || dataMembresias || []);
        setProductos(dataProductos || []);

        setDatosIngresos(
          (repVentas.chartData || []).map((d: any) => ({ name: d.fecha, total: d.ingresos }))
        );
        setDatosAsistencias(
          (repAsistencias.chartData || []).map((d: any) => ({ time: d.hora, count: d.ingresos }))
        );
        setDatosMembresiasGrafico(
          (repMembresias.chartData || []).map((d: any, i: number) => ({
            name: d.name,
            value: d.value,
            color: COLORES_PLANES[i % COLORES_PLANES.length],
          }))
        );

        // Ingresos del mes actual vs. mes anterior, calculado desde las ventas reales
        const ahora = new Date();
        const mesActual = ahora.getMonth();
        const anioActual = ahora.getFullYear();
        const mesAnteriorDate = new Date(anioActual, mesActual - 1, 1);

        const ventasCompletadas = (todasVentas || []).filter((v: any) => v.estado === 'Completado');

        const totalMesActual = ventasCompletadas
          .filter((v: any) => {
            const f = new Date(v.createdAt);
            return f.getMonth() === mesActual && f.getFullYear() === anioActual;
          })
          .reduce((acc: number, v: any) => acc + Number(v.total), 0);

        const totalMesAnterior = ventasCompletadas
          .filter((v: any) => {
            const f = new Date(v.createdAt);
            return f.getMonth() === mesAnteriorDate.getMonth() && f.getFullYear() === mesAnteriorDate.getFullYear();
          })
          .reduce((acc: number, v: any) => acc + Number(v.total), 0);

        setIngresosMes(totalMesActual);
        setVariacionMes(totalMesAnterior > 0 ? ((totalMesActual - totalMesAnterior) / totalMesAnterior) * 100 : null);
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
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-4 text-gray-900">
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 bg-yellow-50 rounded-lg border border-yellow-100 text-[#e6b010]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 tracking-wide">Resumen General</h1>
            <p className="text-[11px] text-gray-500 mt-0.5">Métricas principales y rendimiento de TemploGym.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 w-full sm:w-auto justify-end">
          <Clock className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs font-medium text-gray-700">
            {new Date().toLocaleDateString('es-PE', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between group hover:border-gray-900 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Ingresos (Mes)</p>
              <h3 className="text-xl font-extrabold text-gray-900">S/ {ingresosMes.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            </div>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg border border-green-100 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs border-t border-gray-100 pt-2">
            {variacionMes !== null ? (
              <div className="flex items-center">
                <ArrowUpRight className={`w-3.5 h-3.5 mr-1 ${variacionMes >= 0 ? 'text-green-500' : 'text-red-500 rotate-90'}`} />
                <span className={`font-semibold mr-1 ${variacionMes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {variacionMes >= 0 ? '+' : ''}{variacionMes.toFixed(1)}%
                </span>
                <span className="text-gray-400 text-[10px]">vs mes ant.</span>
              </div>
            ) : (
              <span className="text-gray-400 text-[10px]">Sin ventas el mes anterior para comparar</span>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between group hover:border-gray-900 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Membresías Activas</p>
              <h3 className="text-xl font-extrabold text-gray-900">
                {cargando ? '...' : membresiasActivas}
              </h3>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 group-hover:scale-105 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs border-t border-gray-100 pt-2">
            <div className="flex items-center">
              <Activity className="w-3.5 h-3.5 text-blue-500 mr-1" />
              <span className="text-gray-400 text-[10px]">Total en sistema</span>
            </div>
            {membresiasVencenHoy > 0 ? (
              <span className="text-red-500 font-medium bg-red-50 px-1.5 py-0.5 rounded text-[10px] border border-red-200">
                {membresiasVencenHoy} vencen hoy
              </span>
            ) : (
              <span className="text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded text-[10px] border border-green-200">
                Ninguna vence hoy
              </span>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between group hover:border-gray-900 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Personal Registrado</p>
              <h3 className="text-xl font-extrabold text-gray-900">
                {cargando ? '...' : totalUsuarios}
              </h3>
            </div>
            <div className="p-2 bg-yellow-50 text-[#e6b010] rounded-lg border border-yellow-100 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs border-t border-gray-100 pt-2">
            <div className="flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 text-[#e6b010] mr-1" />
              <span className="text-gray-900 font-semibold mr-1">{administradores}</span>
              <span className="text-gray-400 text-[10px]">Admins</span>
            </div>
            <span className="text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded text-[10px] border border-green-200">{totalUsuarios} Activos</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between group hover:border-gray-900 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Alertas de Stock</p>
              <h3 className="text-xl font-extrabold text-gray-900">
                {cargando ? '...' : alertasStockReales.length}
              </h3>
            </div>
            <div className="p-2 bg-red-50 text-red-500 rounded-lg border border-red-100 group-hover:scale-105 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs border-t border-gray-100 pt-2">
            <div className="flex items-center">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 mr-1" />
              <span className="text-red-600 font-semibold text-[10px]">Requieren atención</span>
            </div>
            <span className="text-gray-400 text-[10px] font-medium">Inventario</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm lg:col-span-2 xl:col-span-2 flex flex-col">
          <div className="mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">Ingresos de la Semana</h3>
            <p className="text-[10px] text-gray-500 mt-0.5">Volumen de ventas en soles (S/)</p>
          </div>
          <div className="h-[220px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosIngresos} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
                <Bar dataKey="total" fill="#111827" radius={[4, 4, 0, 0]} barSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">Asistencias Hoy</h3>
            <p className="text-[10px] text-gray-500 mt-0.5">Flujo de clientes</p>
          </div>
          <div className="h-[220px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={datosAsistencias} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAsistencia" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e6b010" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#e6b010" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" stroke="#e6b010" strokeWidth={2} fillOpacity={1} fill="url(#colorAsistencia)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">Planes Activos</h3>
            <p className="text-[10px] text-gray-500 mt-0.5">Distribución de membresías</p>
          </div>
          <div className="h-[150px] w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={datosMembresiasGrafico} innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                  {datosMembresiasGrafico.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-2 pt-2 border-t border-gray-100">
            {datosMembresiasGrafico.map((d, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></span>
                <span className="text-[10px] font-medium text-gray-600">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden lg:col-span-2 flex flex-col">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">Personal Registrado</h3>
            </div>
          </div>
          <div className="overflow-x-auto custom-scrollbar flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                  <th className="py-3 px-4 pl-5">Usuario</th>
                  <th className="py-3 px-4">Cargo</th>
                  <th className="py-3 px-4 pr-5 text-right">Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {recientes.length === 0 && !cargando ? (
                  <tr><td colSpan={3} className="py-10 text-center text-gray-500">No hay registros recientes.</td></tr>
                ) : (
                  recientes.map((u) => {
                    const iniciales = `${u.nombres?.charAt(0) ?? u.nombreUsuario?.charAt(0) ?? '?'}${u.apellidos?.charAt(0) ?? ''}`;
                    return (
                      <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4 pl-5">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-yellow-50 text-[#e6b010] flex items-center justify-center font-bold text-[10px] border border-yellow-100 shrink-0">
                              {iniciales}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{u.nombres || u.apellidos ? `${u.nombres ?? ''} ${u.apellidos ?? ''}`.trim() : u.nombreUsuario}</p>
                              <p className="text-[10px] text-gray-500">@{u.nombreUsuario}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700 font-medium">{u.cargo || '---'}</td>
                        <td className="py-3 px-4 pr-5 text-right text-gray-500">
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

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">Alertas de Stock</h3>
            </div>
            <span className="text-[10px] font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded-md border border-red-200">
              {alertasStockReales.length}
            </span>
          </div>
          <div className="p-3 flex-1 overflow-y-auto max-h-[250px] custom-scrollbar space-y-2">
            {alertasStockReales.length === 0 && !cargando ? (
              <div className="py-10 text-center text-gray-400 text-xs">
                <PackageOpen className="w-8 h-8 mx-auto mb-2 text-green-500" />
                Todo el inventario está en niveles óptimos.
              </div>
            ) : (
              alertasStockReales.map((alerta) => {
                const esCritico = alerta.stock === 0 || alerta.stock <= (alerta.stockMinimo / 2);
                return (
                  <div key={alerta.id} className="flex items-center justify-between p-2.5 bg-gray-50/50 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-md shrink-0 ${esCritico ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-orange-50 text-orange-500 border border-orange-100'}`}>
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{alerta.nombre}</p>
                        <p className="text-[10px] text-gray-500">Quedan: {alerta.stock} und. (Mín: {alerta.stockMinimo})</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0 ${esCritico ? 'bg-red-50 text-red-700 border-red-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                      {alerta.stock === 0 ? 'Agotado' : 'Crítico'}
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
