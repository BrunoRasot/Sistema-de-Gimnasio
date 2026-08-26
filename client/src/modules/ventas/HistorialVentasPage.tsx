import { useState, useEffect, useMemo } from 'react';
import { Search, FileText, Loader2, RefreshCw, Receipt, Download } from 'lucide-react';
import { ventasService } from '../../services/ventas.service';
import toast from 'react-hot-toast';
import type { Venta } from '../../types/venta';
import { TablePagination, useTablePagination } from '../../components/common/TablePagination';

export default function HistorialVentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('Todos');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const cargarVentas = async () => {
    try {
      setCargando(true);
      const data = await ventasService.obtenerVentas();
      setVentas(data);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar el historial de ventas');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarVentas();
  }, []);

  const ventasFiltradas = useMemo(() => {
    const term = busqueda.toLowerCase().trim();
    return ventas.filter((v) => (
      !term || v.codigo?.toLowerCase().includes(term) ||
      v.cliente?.toLowerCase().includes(term) ||
      v.numeroOperacion?.toLowerCase().includes(term) ||
      v.metodoPago?.nombre?.toLowerCase().includes(term)
    ) && (estado === 'Todos' || v.estado === estado) && (!desde || new Date(v.createdAt) >= new Date(`${desde}T00:00:00`)) && (!hasta || new Date(v.createdAt) <= new Date(`${hasta}T23:59:59`)));
  }, [ventas, busqueda, estado, desde, hasta]);
  const paginacion = useTablePagination(ventasFiltradas);
  const exportarCsv = () => {
    const encabezado = ['Código', 'Cliente', 'Método', 'Total', 'Estado', 'Fecha'];
    const filas = ventasFiltradas.map((v) => [v.codigo, v.cliente || 'Público General', v.metodoPago?.nombre || '', Number(v.total).toFixed(2), v.estado, new Date(v.createdAt).toLocaleString()]);
    const csv = [encabezado, ...filas].map((fila) => fila.map((valor) => `"${String(valor).replace(/"/g, '""')}"`).join(',')).join('\n');
    const enlace = document.createElement('a'); enlace.href = URL.createObjectURL(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' })); enlace.download = 'ventas.csv'; enlace.click(); URL.revokeObjectURL(enlace.href);
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-4 text-gray-900">
      <div className="module-header bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 bg-yellow-50 rounded-lg border border-yellow-100 text-[#e6b010]">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 tracking-wide">Historial de Ventas</h1>
            <p className="text-[11px] text-gray-500 mt-0.5">Consulta todas las transacciones registradas en el sistema.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button onClick={cargarVentas} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-500 transition-all border border-gray-200" title="Actualizar">
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto_auto_auto_auto]">
       <div className="relative flex items-center">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por código, cliente, N° operación o método..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-xs text-gray-900 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all placeholder-gray-400 shadow-sm"
        />
       </div>
       <select aria-label="Filtrar por estado" value={estado} onChange={(e) => setEstado(e.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs"><option>Todos</option><option>Completado</option><option>ParcialmenteDevuelto</option><option>Devuelto</option><option>Anulado</option></select>
       <input aria-label="Fecha desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs" />
       <input aria-label="Fecha hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs" />
       <button onClick={exportarCsv} disabled={!ventasFiltradas.length} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs font-medium text-yellow-800 disabled:opacity-50"><Download className="h-3.5 w-3.5" /> CSV</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <th className="py-3 px-4 pl-5">Código</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Método Pago</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4 text-center pr-5">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {cargando ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#e6b010]" /> Cargando historial de ventas...
                  </td>
                </tr>
              ) : ventasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-500">No se encontraron ventas registradas.</td>
                </tr>
              ) : (
                paginacion.rows.map((venta) => (
                  <tr key={venta.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 pl-5 font-bold text-gray-900">{venta.codigo}</td>
                    <td className="py-3 px-4 text-gray-700">{venta.cliente || 'Público General'}</td>
                    <td className="py-3 px-4 text-gray-600">
                      <span className="bg-gray-100 px-2.5 py-0.5 rounded-md text-[10px] font-medium border border-gray-200">{venta.pagos && venta.pagos.length > 1 ? `Mixto (${venta.pagos.length})` : venta.metodoPago?.nombre || 'Sin método'}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">S/ {Number(venta.total).toFixed(2)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${venta.estado === 'Completado' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {venta.estado}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{new Date(venta.createdAt).toLocaleString()}</td>
                    <td className="py-3 px-4 text-center pr-5">
                      <a
                        href={`/ventas/comprobantes?id=${venta.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5" /> Ver
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <TablePagination {...paginacion} />
      </div>
    </div>
  );
}
