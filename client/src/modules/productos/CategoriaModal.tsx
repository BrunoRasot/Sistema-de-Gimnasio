import { useState, useEffect } from 'react';
import { X, Tag, Loader2, Save, AlignLeft, CheckCircle2, Ban } from 'lucide-react';
import { crearCategoria, actualizarCategoria } from '../../services/categorias.service';
import { Categoria } from '../../types/categoria';

interface CategoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoriaAEditar?: Categoria | null;
}

const estadoInicial = { nombre: '', descripcion: '', estado: true };

export const CategoriaModal = ({ isOpen, onClose, onSuccess, categoriaAEditar }: CategoriaModalProps) => {
  const isEdit = !!categoriaAEditar;
  const [formData, setFormData] = useState(estadoInicial);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (categoriaAEditar) {
        setFormData({
          nombre: categoriaAEditar.nombre ?? '',
          descripcion: categoriaAEditar.descripcion ?? '',
          estado: categoriaAEditar.estado ?? true,
        });
      } else {
        setFormData(estadoInicial);
      }
      setError('');
    }
  }, [isOpen, categoriaAEditar]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      setError('El nombre de la categoría es obligatorio.');
      return;
    }

    setCargando(true);
    setError('');

    try {
      if (isEdit && categoriaAEditar) {
        await actualizarCategoria(categoriaAEditar.id, formData);
      } else {
        await crearCategoria(formData);
      }

      setFormData(estadoInicial);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la categoría.');
    } finally {
      setCargando(false);
    }
  };

  const inputClass = "w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:border-[#e6b010] focus:ring-2 focus:ring-[#e6b010]/20 outline-none transition-all duration-200 placeholder-gray-400 shadow-sm";
  const labelClass = "block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-wide">
              {isEdit ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {isEdit ? 'Modifica los detalles de esta familia de productos.' : 'Crea una nueva familia para organizar tu inventario.'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 bg-white">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
              {error}
            </div>
          )}

          <form id="categoriaForm" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelClass}><Tag className="w-3 h-3 inline mr-1" />Nombre de la Categoría *</label>
              <input 
                required 
                name="nombre" 
                value={formData.nombre} 
                onChange={handleChange} 
                className={inputClass} 
                placeholder="Ej. Suplementos, Bebidas, Ropa..." 
              />
            </div>
            
            <div>
              <label className={labelClass}><AlignLeft className="w-3 h-3 inline mr-1" />Descripción (Opcional)</label>
              <textarea 
                name="descripcion" 
                value={formData.descripcion} 
                onChange={handleChange} 
                rows={3} 
                className={`${inputClass} resize-none`} 
                placeholder="Breve descripción de los productos que incluye..." 
              />
            </div>

            <div>
              <label className={labelClass}>Estado</label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, estado: true })}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                    formData.estado 
                      ? 'bg-green-50 text-green-700 border-green-300' 
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" /> Activo
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, estado: false })}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                    !formData.estado 
                      ? 'bg-red-50 text-red-700 border-red-300' 
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <Ban className="w-4 h-4" /> Inactivo
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-xl transition-all">
            Cancelar
          </button>
          <button type="submit" form="categoriaForm" disabled={cargando} className="flex items-center gap-2 px-6 py-2.5 bg-[#e6b010] hover:bg-[#d4a00e] text-white font-bold text-sm rounded-xl shadow-md disabled:opacity-70 transition-all duration-300">
            {cargando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {cargando ? 'Guardando...' : 'Guardar Categoría'}
          </button>
        </div>
      </div>
    </div>
  );
};