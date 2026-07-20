import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, Dumbbell, CalendarDays, Tag, X, Save, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { obtenerPlanes, crearPlan, actualizarPlan, eliminarPlan } from '../../services/planes.service';
import { usePermisos } from '../../hooks/usePermisos';
interface Plan {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string | number;
  duracionDias: number;
  estado: string;
}

export default function PlanesPage() {
  const { permisos, cargandoPermisos } = usePermisos('membresias');

  const [planes, setPlanes] = useState<Plan[]>([]);
  const [cargando, setCargando] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [planEditando, setPlanEditando] = useState<Plan | null>(null);
  const [guardando, setGuardando] = useState(false);

  const estadoInicial = { nombre: '', descripcion: '', precio: '', duracionDias: '', estado: 'Activo' };
  const [formData, setFormData] = useState<any>(estadoInicial);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const data = await obtenerPlanes();
      setPlanes(data);
    } catch (err: any) {
      if (err.message.includes('403')) {
        setPlanes([]);
      } else {
        toast.error('Error al cargar los planes.');
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!cargandoPermisos && permisos.ver) {
      cargarDatos();
    } else if (!cargandoPermisos && !permisos.ver) {
      setCargando(false);
    }
  }, [permisos.ver, cargandoPermisos]);

  const handleAbrirModal = (plan?: Plan) => {
    if (plan) {
      setPlanEditando(plan);
      setFormData({
        nombre: plan.nombre,
        descripcion: plan.descripcion || '',
        precio: plan.precio,
        duracionDias: plan.duracionDias,
        estado: plan.estado
      });
    } else {
      setPlanEditando(null);
      setFormData(estadoInicial);
    }
    setIsModalOpen(true);
  };

  const handleEliminar = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este plan de membresía de forma permanente?')) {
      try {
        await eliminarPlan(id);
        cargarDatos();
        toast.success('Plan eliminado con éxito');
      } catch (error: any) {
        toast.error(error.message || 'Error al eliminar el plan');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      if (planEditando) {
        await actualizarPlan(planEditando.id, formData);
        toast.success('Plan actualizado correctamente');
      } else {
        await crearPlan(formData);
        toast.success('Plan creado exitosamente');
      }
      setIsModalOpen(false);
      cargarDatos();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar el plan.');
    } finally {
      setGuardando(false);
    }
  };

  if (!cargandoPermisos && !permisos.ver) {
    return (
      <div className="p-6 max-w-[1600px] mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <ShieldAlert className="w-20 h-20 text-red-100 mb-6" />
        <h2 className="text-2xl font-bold text-gray-900">Acceso Restringido</h2>
        <p className="text-gray-500 mt-2 max-w-md">Tu cargo actual no tiene los privilegios necesarios para visualizar el módulo de Planes y Membresías.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto text-gray-900">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-yellow-50 to-white rounded-xl border border-yellow-200 shadow-sm">
            <Dumbbell className="w-6 h-6 text-[#e6b010]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Planes y Precios</h1>
            <p className="text-sm text-gray-500 mt-0.5">Administra las tarifas y opciones de membresía de tu gimnasio.</p>
          </div>
        </div>

        {/* CONDICIONAL: Solo mostrar botón NUEVO si tiene permiso de CREAR */}
        {permisos.crear && planes.length > 0 && !cargando && (
          <button
            onClick={() => handleAbrirModal()}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#e6b010] hover:bg-[#d4a00e] text-white font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" /> Nuevo Plan
          </button>
        )}
      </div>

      {cargando || cargandoPermisos ? (
        <div className="flex flex-col items-center justify-center p-20 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#e6b010]" />
          <p className="text-sm font-medium">Cargando información segura...</p>
        </div>
      ) : planes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
            <Tag className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Aún no hay planes registrados</h3>
          {permisos.crear && (
            <button
              onClick={() => handleAbrirModal()}
              className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl text-sm transition-all shadow-md"
            >
              <Plus className="w-4 h-4" /> Crear mi primer plan
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200">
                  <th className="p-5 pl-6">Plan de Membresía</th>
                  <th className="p-5">Descripción</th>
                  <th className="p-5">Duración</th>
                  <th className="p-5">Precio</th>
                  <th className="p-5">Estado</th>
                  <th className="p-5 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {planes.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center border border-yellow-100 shrink-0">
                          <Tag className="w-4 h-4 text-[#e6b010]" />
                        </div>
                        <p className="font-bold text-gray-900">{plan.nombre}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-gray-500 max-w-sm line-clamp-2">{plan.descripcion || '---'}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                        <CalendarDays className="w-4 h-4 text-gray-400" />
                        {plan.duracionDias} d
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-gray-900 text-lg">
                        S/ {Number(plan.precio).toFixed(2)}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${plan.estado === 'Activo' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                        }`}>
                        {plan.estado}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">

                        {/* CONDICIONAL: Solo mostrar lápiz si tiene permiso de EDITAR */}
                        {permisos.editar && (
                          <button onClick={() => handleAbrirModal(plan)} className="p-2 text-gray-500 hover:text-[#e6b010] hover:bg-yellow-50 rounded-lg transition-all" title="Editar">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* CONDICIONAL: Solo mostrar basura si tiene permiso de ELIMINAR */}
                        {permisos.eliminar && (
                          <button onClick={() => handleEliminar(plan.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Eliminar">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DE EDICIÓN/CREACIÓN */}
      {isModalOpen && permisos.crear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">{planEditando ? 'Editar Plan' : 'Crear Nuevo Plan'}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-xl transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Nombre del Plan *</label>
                <input required name="nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:border-[#e6b010] focus:ring-4 focus:ring-[#e6b010]/10 outline-none transition-all" placeholder="Ej. Pase Anual VIP" />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Precio Total (S/) *</label>
                  <div className="relative">
                    <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input required type="number" step="0.01" min="0" value={formData.precio} onChange={(e) => setFormData({ ...formData, precio: e.target.value })} className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-900 focus:border-[#e6b010] focus:ring-4 focus:ring-[#e6b010]/10 outline-none transition-all font-semibold" placeholder="0.00" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Duración (Días) *</label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input required type="number" min="1" value={formData.duracionDias} onChange={(e) => setFormData({ ...formData, duracionDias: e.target.value })} className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-900 focus:border-[#e6b010] focus:ring-4 focus:ring-[#e6b010]/10 outline-none transition-all font-semibold" placeholder="Ej. 30" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Descripción / Beneficios</label>
                <textarea rows={3} value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:border-[#e6b010] focus:ring-4 focus:ring-[#e6b010]/10 outline-none resize-none transition-all" placeholder="Ej: Incluye acceso a todas las máquinas..." />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Estado del Plan</label>
                <select value={formData.estado} onChange={(e) => setFormData({ ...formData, estado: e.target.value })} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:border-[#e6b010] focus:ring-4 focus:ring-[#e6b010]/10 outline-none transition-all font-medium">
                  <option value="Activo">Activo (Disponible para vender)</option>
                  <option value="Inactivo">Inactivo (Oculto en ventas)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all">Cancelar</button>
                <button type="submit" disabled={guardando} className="flex items-center gap-2 px-6 py-2.5 bg-[#e6b010] hover:bg-[#d4a00e] text-white font-bold text-sm rounded-xl shadow-md transition-all">
                  {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {guardando ? 'Guardando...' : 'Guardar Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}