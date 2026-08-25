import { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, RefreshCw, Loader2, PackageOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { obtenerProductos } from '../../services/productos.service';

export default function StockAlertasPage() {
  const [productos, setProductos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const prods = await obtenerProductos();
      setProductos(prods);
    } catch (err) {
      toast.error('Error al cargar alertas de stock');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const alertas = useMemo(() => {
    return productos.filter(p => p.estado === 'Activo' && p.stock <= p.stockMinimo)
                    .sort((a, b) => a.stock - b.stock); 
  }, [productos]);

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-4 text-gray-900">
      
      <div className="module-header bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 bg-red-50 rounded-lg border border-red-100 text-red-500">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 tracking-wide">Alertas de Stock</h1>
            <p className="text-[11px] text-gray-500 mt-0.5">Productos con stock crítico o bajo el mínimo recomendado.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button onClick={cargarDatos} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-500 transition-all border border-gray-200" title="Actualizar">
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin text-red-500' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <th className="py-3 px-4 pl-5">Producto / SKU</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4 text-center">Stock Actual</th>
                <th className="py-3 px-4 text-center">Stock Mínimo</th>
                <th className="py-3 px-4 text-center pr-5">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {cargando ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-red-500" /> Revisando inventario...
                  </td>
                </tr>
              ) : alertas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    <PackageOpen className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    No hay alertas. Todos los productos tienen buen stock.
                  </td>
                </tr>
              ) : (
                alertas.map((p) => (
                  <tr key={p.id} className="hover:bg-red-50/30 transition-colors">
                    <td className="py-3 px-4 pl-5">
                      <p className="font-bold text-gray-900">{p.nombre}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">SKU: {p.sku}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{p.categoria?.nombre || '---'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-red-600 text-sm">{p.stock}</span>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">{p.stockMinimo}</td>
                    <td className="py-3 px-4 text-center pr-5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${p.stock === 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                        {p.stock === 0 ? 'Agotado' : 'Crítico'}
                      </span>
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
