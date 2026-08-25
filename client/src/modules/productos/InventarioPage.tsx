import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, RefreshCw, Edit2, Trash2, Package, Loader2, X, Save, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { obtenerProductos, crearProducto, actualizarProducto, eliminarProducto } from '../../services/productos.service';
import { obtenerCategorias } from '../../services/categorias.service';
import { obtenerProveedores } from '../../services/proveedores.service';

export default function InventarioPage() {
  const [productos, setProductos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [buscar, setBuscar] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productoEditando, setProductoEditando] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    nombre: '', sku: '', descripcion: '', precioCompra: 0, precioVenta: 0, 
    stock: 0, stockMinimo: 5, categoriaId: '', proveedorId: '', estado: 'Activo'
  });
  const [guardando, setGuardando] = useState(false);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [prods, cats, provs] = await Promise.all([
        obtenerProductos(), obtenerCategorias(), obtenerProveedores()
      ]);
      setProductos(prods);
      setCategorias(cats.filter((c: any) => c.estado)); 
      setProveedores(provs.filter((p: any) => p.estado));
    } catch (err) {
      toast.error('Error al cargar inventario');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleOpenModal = (producto?: any) => {
    if (producto) {
      setProductoEditando(producto);
      setFormData({
        nombre: producto.nombre, sku: producto.sku, descripcion: producto.descripcion || '',
        precioCompra: producto.precioCompra, precioVenta: producto.precioVenta,
        stock: producto.stock, stockMinimo: producto.stockMinimo,
        categoriaId: producto.categoriaId.toString(),
        proveedorId: producto.proveedorId ? producto.proveedorId.toString() : '',
        estado: producto.estado
      });
    } else {
      setProductoEditando(null);
      setFormData({
        nombre: '', sku: '', descripcion: '', precioCompra: 0, precioVenta: 0,
        stock: 0, stockMinimo: 5, categoriaId: '', proveedorId: '', estado: 'Activo'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoriaId) return toast.error('Selecciona una categoría');
    
    setGuardando(true);
    try {
      if (productoEditando) {
        await actualizarProducto(productoEditando.id, formData);
        toast.success('Producto actualizado');
      } else {
        await crearProducto(formData);
        toast.success('Producto registrado');
      }
      setIsModalOpen(false);
      cargarDatos();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar el producto');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = (producto: any) => {
    Swal.fire({
      title: '¿Eliminar producto?',
      text: `¿Seguro de eliminar "${producto.nombre}" (SKU: ${producto.sku})?`,
      icon: 'warning',
      background: '#ffffff',
      color: '#1f2937',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#e5e7eb',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: '<span style="color: black">Cancelar</span>',
      customClass: { popup: 'border border-gray-200 rounded-xl shadow-xl' }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await eliminarProducto(producto.id);
          toast.success('Producto eliminado');
          cargarDatos();
        } catch (err: any) {
          Swal.fire({ title: 'Error', text: err.message || 'No se pudo eliminar', icon: 'error', background: '#ffffff', color: '#1f2937' });
        }
      }
    });
  };

  const productosFiltrados = useMemo(() => {
    const term = buscar.toLowerCase();
    return productos.filter(p => 
      p.nombre.toLowerCase().includes(term) || 
      p.sku.toLowerCase().includes(term) ||
      p.categoria?.nombre?.toLowerCase().includes(term)
    );
  }, [productos, buscar]);

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-4 text-gray-900">
      
      <div className="module-header bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 bg-yellow-50 rounded-lg border border-yellow-100 text-[#e6b010]">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 tracking-wide">Inventario</h1>
            <p className="text-[11px] text-gray-500 mt-0.5">Gestión completa de productos y stock.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button onClick={cargarDatos} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-500 transition-all border border-gray-200" title="Actualizar">
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-[#141414] hover:bg-black text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shadow-sm">
            <Plus className="w-3.5 h-3.5" /> Nuevo Producto
          </button>
        </div>
      </div>

      <div className="relative flex items-center">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, SKU o categoría..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-xs text-gray-900 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all placeholder-gray-400 shadow-sm"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <th className="py-3 px-4 pl-5">Producto / SKU</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Proveedor</th>
                <th className="py-3 px-4 text-right">Precio Venta</th>
                <th className="py-3 px-4 text-center">Stock</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-center pr-5">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {cargando ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#e6b010]" /> Cargando inventario...
                  </td>
                </tr>
              ) : productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-500">No se encontraron productos.</td>
                </tr>
              ) : (
                productosFiltrados.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 pl-5">
                      <p className="font-bold text-gray-900">{p.nombre}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">SKU: {p.sku}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{p.categoria?.nombre || '---'}</td>
                    <td className="py-3 px-4 text-gray-700">{p.proveedor?.nombre || '---'}</td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">S/ {Number(p.precioVenta).toFixed(2)}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={`font-bold ${p.stock <= p.stockMinimo ? 'text-red-600' : 'text-gray-900'}`}>{p.stock}</span>
                        {p.stock <= p.stockMinimo && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${p.estado === 'Activo' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {p.estado}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center pr-5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => handleOpenModal(p)} className="p-1.5 text-gray-500 hover:text-[#e6b010] hover:bg-yellow-50 rounded-md transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleEliminar(p)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl bg-white border border-gray-200 rounded-xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-sm font-bold text-gray-900">{productoEditando ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-700 rounded-lg transition-all"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Nombre del Producto *</label>
                  <input required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:border-gray-900 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">SKU / Código *</label>
                  <input required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:border-gray-900 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Categoría *</label>
                  <select required value={formData.categoriaId} onChange={e => setFormData({...formData, categoriaId: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:border-gray-900 outline-none">
                    <option value="">Selecciona...</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Precio Compra (S/)</label>
                  <input type="number" step="0.01" value={formData.precioCompra} onChange={e => setFormData({...formData, precioCompra: parseFloat(e.target.value)} )} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:border-gray-900 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Precio Venta (S/) *</label>
                  <input required type="number" step="0.01" value={formData.precioVenta} onChange={e => setFormData({...formData, precioVenta: parseFloat(e.target.value)})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:border-gray-900 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Stock Actual</label>
                  <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:border-gray-900 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Stock Mínimo (Alerta)</label>
                  <input type="number" value={formData.stockMinimo} onChange={e => setFormData({...formData, stockMinimo: parseInt(e.target.value)})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:border-gray-900 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Proveedor</label>
                  <select value={formData.proveedorId} onChange={e => setFormData({...formData, proveedorId: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:border-gray-900 outline-none">
                    <option value="">Ninguno</option>
                    {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Estado</label>
                  <select value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:border-gray-900 outline-none">
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
              <div className="pt-3 flex justify-end gap-2 border-t border-gray-100 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-all">Cancelar</button>
                <button type="submit" disabled={guardando} className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-900 hover:bg-gray-800 text-white font-medium text-xs rounded-lg shadow-sm disabled:opacity-70 transition-all">
                  {guardando && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <Save className="w-3.5 h-3.5" /> Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
