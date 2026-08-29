import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, RefreshCw, Edit2, Trash2, FolderTree, Loader2, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { usePermisos } from '../../hooks/usePermisos';
import { obtenerCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } from '../../services/categorias.service';

export default function CategoriasPage() {
  const { permisos } = usePermisos('productos');
  const [categorias, setCategorias] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [buscar, setBuscar] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<any | null>(null);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '', estado: true });
  const [guardando, setGuardando] = useState(false);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const data = await obtenerCategorias();
      setCategorias(data);
    } catch {
      toast.error('Error al cargar categorías');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleOpenModal = (categoria?: any) => {
    if (categoria) {
      setCategoriaEditando(categoria);
      setFormData({ nombre: categoria.nombre, descripcion: categoria.descripcion || '', estado: categoria.estado });
    } else {
      setCategoriaEditando(null);
      setFormData({ nombre: '', descripcion: '', estado: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      if (categoriaEditando) {
        await actualizarCategoria(categoriaEditando.id, formData);
        toast.success('Categoría actualizada');
      } else {
        await crearCategoria(formData);
        toast.success('Categoría creada');
      }
      setIsModalOpen(false);
      cargarDatos();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = (categoria: any) => {
    Swal.fire({
      title: '¿Eliminar categoría?',
      text: `¿Estás seguro de eliminar "${categoria.nombre}"?`,
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
          await eliminarCategoria(categoria.id);
          toast.success('Categoría eliminada');
          cargarDatos();
        } catch (err: any) {
          Swal.fire({ title: 'Error', text: err.message || 'No se pudo eliminar', icon: 'error', background: '#ffffff', color: '#1f2937' });
        }
      }
    });
  };

  const categoriasFiltradas = useMemo(() => {
    return categorias.filter(c => c.nombre.toLowerCase().includes(buscar.toLowerCase()));
  }, [categorias, buscar]);

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-4 text-gray-900">
      
      <div className="module-header bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 bg-yellow-50 rounded-lg border border-yellow-100 text-[#e6b010]">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 tracking-wide">Categorías</h1>
            <p className="text-[11px] text-gray-500 mt-0.5">Administra las familias de productos de tu inventario.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button onClick={cargarDatos} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-500 transition-all border border-gray-200" title="Actualizar">
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
          </button>
          {permisos.crear && <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-[#141414] hover:bg-black text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shadow-sm">
            <Plus className="w-3.5 h-3.5" /> Nueva Categoría
          </button>}
        </div>
      </div>

      <div className="relative flex items-center">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar categoría..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-xs text-gray-900 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all placeholder-gray-400 shadow-sm"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <th className="py-3 px-4 pl-5">Nombre</th>
                <th className="py-3 px-4">Descripción</th>
                <th className="py-3 px-4 text-center">Productos Asociados</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-center pr-5">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {cargando ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#e6b010]" /> Cargando...
                  </td>
                </tr>
              ) : categoriasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-500">No hay categorías registradas.</td>
                </tr>
              ) : (
                categoriasFiltradas.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 pl-5 font-bold text-gray-900">{c.nombre}</td>
                    <td className="py-3 px-4 text-gray-600">{c.descripcion || '---'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-md text-[10px] font-bold border border-gray-200">{c._count?.productos || 0}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${c.estado ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {c.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center pr-5">
                      <div className="flex items-center justify-center gap-1.5">
                        {permisos.editar && <button onClick={() => handleOpenModal(c)} className="p-1.5 text-gray-500 hover:text-[#e6b010] hover:bg-yellow-50 rounded-md transition-all"><Edit2 className="w-3.5 h-3.5" /></button>}
                        {permisos.eliminar && <button onClick={() => handleEliminar(c)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"><Trash2 className="w-3.5 h-3.5" /></button>}
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
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-sm font-bold text-gray-900">{categoriaEditando ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-700 rounded-lg transition-all"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Nombre *</label>
                <input required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:border-gray-900 outline-none placeholder-gray-400" placeholder="Ej. Suplementos" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Descripción</label>
                <textarea rows={3} value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:border-gray-900 outline-none resize-none placeholder-gray-400" placeholder="Detalles opcionales..." />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="estadoCat" checked={formData.estado} onChange={e => setFormData({...formData, estado: e.target.checked})} className="w-3.5 h-3.5 text-gray-900 rounded border-gray-300 focus:ring-gray-900 cursor-pointer" />
                <label htmlFor="estadoCat" className="text-xs font-medium text-gray-700 cursor-pointer">Categoría Activa</label>
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
