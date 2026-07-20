import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import { obtenerProductos } from '../../services/productos.service';
import { Producto } from '../../types/producto';

export default function InventarioPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarInventario = async () => {
      try {
        const data = await obtenerProductos();
        setProductos(data);
      } catch (error) {
        console.error("Error al cargar inventario:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarInventario();
  }, []);

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          <p className="text-sm text-gray-500">Gestión de stock, productos y suministros.</p>
        </div>
        <button className="bg-[#e6b010] text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#d4a00e] transition-all">
          <Plus className="w-4 h-4" /> Nuevo Producto
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, SKU o categoría..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e6b010]/20"
          />
        </div>

        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-500">
            <tr>
              <th className="p-3">Producto</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Categoría</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {cargando ? (
              <tr><td colSpan={6} className="p-6 text-center text-gray-400">Cargando inventario...</td></tr>
            ) : productos.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="p-3 font-medium">{p.nombre}</td>
                <td className="p-3 text-gray-500">{p.sku}</td>
                <td className="p-3 text-gray-500">{p.categoria}</td>
                <td className="p-3 font-semibold">{p.stock}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${p.estado === 'Crítico' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {p.estado}
                  </span>
                </td>
                <td className="p-3 flex gap-2">
                  <button className="p-1 hover:text-[#e6b010]"><Edit className="w-4 h-4" /></button>
                  <button className="p-1 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}