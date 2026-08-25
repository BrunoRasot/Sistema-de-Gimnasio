import { useState, useEffect } from 'react';
import { CreditCard, Loader2, Save, Power, PowerOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { pagosService } from '../../services/pagos.service';

export default function MetodosPagoPage() {
  const [metodos, setMetodos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  
  const [formulario, setFormulario] = useState({ id: 0, nombre: '', descripcion: '', activo: true });

  const cargarMetodos = async () => {
    try {
      setCargando(true);
      const data = await pagosService.obtenerMetodos();
      setMetodos(data);
    } catch (error) {
      toast.error('Error al cargar métodos de pago');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarMetodos(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setGuardando(true);
      if (formulario.id) {
        await pagosService.actualizarMetodo(formulario.id, formulario);
        toast.success('Método actualizado exitosamente');
      } else {
        await pagosService.crearMetodo(formulario);
        toast.success('Método creado exitosamente');
      }
      setFormulario({ id: 0, nombre: '', descripcion: '', activo: true });
      cargarMetodos();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setGuardando(false);
    }
  };

  const toggleEstado = async (metodo: any) => {
    try {
      await pagosService.actualizarMetodo(metodo.id, { ...metodo, activo: !metodo.activo });
      toast.success(`Método ${metodo.activo ? 'desactivado' : 'activado'}`);
      cargarMetodos();
    } catch (error: any) {
      toast.error('Error al cambiar el estado');
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-4 text-gray-900">
      <div className="module-header bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
        <div className="p-2.5 bg-yellow-50 rounded-lg border border-yellow-100 text-[#e6b010]">
          <CreditCard className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-900 tracking-wide">Configuración de Métodos de Pago</h1>
          <p className="text-[11px] text-gray-500 mt-0.5">Administra los canales por los cuales recibes pagos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* FORMULARIO */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h2 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
            {formulario.id ? 'Editar Método' : 'Nuevo Método'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Nombre *</label>
              <input type="text" value={formulario.nombre} onChange={(e) => setFormulario({...formulario, nombre: e.target.value})} required className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-gray-900" placeholder="Ej. Yape, Plin, Efectivo" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Descripción</label>
              <textarea value={formulario.descripcion} onChange={(e) => setFormulario({...formulario, descripcion: e.target.value})} rows={3} className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-gray-900 resize-none" placeholder="Instrucciones o detalles opcionales" />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="activo" checked={formulario.activo} onChange={(e) => setFormulario({...formulario, activo: e.target.checked})} className="rounded text-[#e6b010] focus:ring-[#e6b010]" />
              <label htmlFor="activo" className="text-xs font-medium text-gray-700">Método Activo</label>
            </div>
            <div className="pt-3 flex gap-2">
              {formulario.id !== 0 && (
                <button type="button" onClick={() => setFormulario({ id: 0, nombre: '', descripcion: '', activo: true })} className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg text-xs transition-colors">Cancelar</button>
              )}
              <button type="submit" disabled={guardando} className="w-full py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm">
                {guardando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Guardar
              </button>
            </div>
          </form>
        </div>

        {/* LISTADO */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto custom-scrollbar flex-1">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                  <th className="py-3 px-4 pl-5">Nombre</th>
                  <th className="py-3 px-4">Descripción</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-center pr-5">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {cargando ? (
                  <tr><td colSpan={4} className="py-10 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-[#e6b010]" /></td></tr>
                ) : metodos.length === 0 ? (
                  <tr><td colSpan={4} className="py-10 text-center text-gray-500">No hay métodos registrados.</td></tr>
                ) : (
                  metodos.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 pl-5 font-bold text-gray-900">{m.nombre}</td>
                      <td className="py-3 px-4 text-gray-600 truncate max-w-[200px]">{m.descripcion || '---'}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${m.activo ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                          {m.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center pr-5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => setFormulario(m)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded text-xs transition-colors">Editar</button>
                          <button onClick={() => toggleEstado(m)} className={`p-1.5 rounded transition-colors ${m.activo ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`} title={m.activo ? 'Desactivar' : 'Activar'}>
                            {m.activo ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
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
      </div>
    </div>
  );
}
