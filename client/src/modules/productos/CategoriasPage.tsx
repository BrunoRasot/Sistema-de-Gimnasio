import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, RefreshCw, Edit2, Trash2, Tag, Loader2 } from 'lucide-react';
import { obtenerCategorias, eliminarCategoria } from '../../services/categorias.service';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { CategoriaModal } from './CategoriaModal'; 
import { Categoria } from '../../types/categoria';

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [buscar, setBuscar] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const data = await obtenerCategorias();
      setCategorias(data);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar las categorías');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleEliminar = (categoria: Categoria) => {
    if (categoria._count?.productos && categoria._count.productos > 0) {
      toast.error('No puedes eliminar una categoría con productos asignados. Desactívala en su lugar.');
      return;
    }

    Swal.fire({
      padding: 0,
      showCloseButton: false,
      buttonsStyling: false,
      background: '#ffffff',
      width: 480,
      customClass: {
        popup: 'rounded-2xl overflow-hidden shadow-2xl border border-gray-200 p-0',
        actions: 'w-full m-0 p-5 bg-white flex justify-end gap-3',
        confirmButton: 'px-5 py-2.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-xl font-bold transition-all shadow-sm',
        cancelButton: 'px-5 py-2.5 text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl font-bold transition-all'
      },
      html: `
        <div class="flex flex-col text-left">
          <div class="bg-[#fef2f2] px-6 py-4 flex items-center justify-between border-b border-red-100">
            <div class="flex items-center gap-2.5 text-[#dc2626]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
              </svg>
              <h2 class="text-[17px] font-bold m-0 p-0 tracking-tight">Eliminar Categoría</h2>
            </div>
            <button type="button" onclick="Swal.close()" class="text-gray-400 hover:text-gray-700 transition-colors focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          <div class="bg-white px-6 pt-6 pb-2">
            <p class="text-gray-600 text-[15px] m-0 leading-relaxed">
              ¿Estás seguro de que deseas eliminar permanentemente la categoría <strong class="text-gray-900 font-bold">${categoria.nombre}</strong>?
            </p>
            <div class="mt-5 p-4 bg-gray-50 border border-gray-200 rounded-xl text-[13.5px] text-gray-500 leading-relaxed shadow-sm">
              Esta acción no se puede deshacer.
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonText: `
        <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>
          </svg>
          <span>Sí, Eliminar</span>
        </div>
      `,
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await eliminarCategoria(categoria.id);
          await cargarDatos();
          toast.success('Categoría eliminada correctamente.');
        } catch (error: any) {
          toast.error(error.message || 'No se pudo eliminar la categoría.');
        }
      }
    });
  };

  const categoriasFiltradas = useMemo(() => {
    const term = buscar.trim().toLowerCase();
    if (!term) return categorias;
    return categorias.filter((c) =>
      c.nombre.toLowerCase().includes(term) ||
      c.descripcion?.toLowerCase().includes(term)
    );
  }, [categorias, buscar]);

  return (
    <div className="p-6 max-w-[1600px] mx-auto text-gray-900">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-100">
            <Tag className="w-6 h-6 text-[#e6b010]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-wide">Categorías</h1>
            <p className="text-sm text-gray-500 mt-1">Administra las familias de productos de tu inventario.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={cargarDatos} className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-900 transition-all border border-gray-200">
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => { setCategoriaEditando(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#e6b010] hover:bg-[#d4a00e] text-white font-bold rounded-xl text-sm transition-all shadow-md"
          >
            <Plus className="w-4 h-4" /> Nueva Categoría
          </button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar categoría por nombre o descripción..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-11 pr-4 text-sm text-gray-900 focus:border-[#e6b010] focus:ring-1 focus:ring-[#e6b010] outline-none transition-all placeholder-gray-400 shadow-sm"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200">
                <th className="p-5 pl-6">Nombre de la Categoría</th>
                <th className="p-5">Descripción</th>
                <th className="p-5 text-center">Productos Asociados</th>
                <th className="p-5 text-center">Estado</th>
                <th className="p-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {cargando ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#e6b010]" /> Cargando categorías...
                  </td>
                </tr>
              ) : categoriasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    No se encontraron categorías registradas.
                  </td>
                </tr>
              ) : (
                categoriasFiltradas.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4 pl-6 font-semibold text-gray-900">{c.nombre}</td>
                    <td className="p-4 text-gray-600">{c.descripcion || '---'}</td>
                    <td className="p-4 text-center">
                      <span className="inline-flex px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full font-bold text-xs">
                        {c._count?.productos ?? 0} ítems
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${c.estado ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                        {c.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setCategoriaEditando(c); setIsModalOpen(true); }}
                          className="p-2 text-gray-500 hover:text-[#e6b010] hover:bg-yellow-50 rounded-lg transition-all" title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEliminar(c)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CategoriaModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setCategoriaEditando(null); }} 
        onSuccess={cargarDatos}
        categoriaAEditar={categoriaEditando}
      />
    </div>
  );
}