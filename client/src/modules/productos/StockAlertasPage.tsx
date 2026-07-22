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
    <div className="p-6 max-w-[1600px] mx-auto text-gray-900">
      {/* Header en diseño claro y ancho completo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 bg-white p-6 rounded-2xl border border-red-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-xl border border-red-100">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-wide">Alertas de Stock</h1>
            <p className="text-sm text-gray-500 mt-1">Productos con stock crítico o bajo el mínimo recomendado.</p>
          </div>
        </div>
        <button onClick={cargarDatos} className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-500 transition-all border border-gray-200">
          <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin text-red-500' : ''}`} />
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200">
                <th className="p-5 pl-6">Producto / SKU</th>
                <th className="p-5">Categoría</th>
                <th className="p-5 text-center">Stock Actual</th>
                <th className="p-5 text-center">Stock Mínimo</th>
                <th className="p-5 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {cargando ? (
                <tr><td colSpan={5} className="p-12 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-red-500" /> Revisando inventario...</td></tr>
              ) : alertas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    <PackageOpen className="w-10 h-10 mx-auto mb-3 text-green-500" />
                    No hay alertas. Todos los productos tienen buen stock.
                  </td>
                </tr>
              ) : (
                alertas.map((p) => (
                  <tr key={p.id} className="hover:bg-red-50/40 transition-colors">
                    <td className="p-4 pl-6">
                      <p className="font-semibold text-gray-900">{p.nombre}</p>
                      <p className="text-xs text-gray-500 mt-0.5">SKU: {p.sku}</p>
                    </td>
                    <td className="p-4 text-gray-700">{p.categoria?.nombre || '---'}</td>
                    <td className="p-4 text-center">
                      <span className="font-bold text-red-600 text-lg">{p.stock}</span>
                    </td>
                    <td className="p-4 text-center text-gray-600">{p.stockMinimo}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${p.stock === 0 ? 'bg-red-100 text-red-700 border-red-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
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