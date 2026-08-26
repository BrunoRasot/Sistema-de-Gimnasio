import { useState, useEffect } from 'react';
import { Dumbbell, Plus, Tag, Edit, Trash2, Loader2, X } from 'lucide-react';
import {
  obtenerPlanes,
  crearPlan,
  actualizarPlan,
  eliminarPlan,
} from '../../services/planes.service';
import toast from 'react-hot-toast';
import { TablePagination, useTablePagination } from '../../components/common/TablePagination';
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
  const { permisos } = usePermisos('membresias');
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [cargando, setCargando] = useState(true);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [planEditando, setPlanEditando] = useState<Plan | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    duracionDias: '',
    estado: 'Activo',
  });

  const cargarPlanes = async () => {
    try {
      setCargando(true);
      const data = await obtenerPlanes();
      setPlanes(data);
    } catch (error: any) {
      toast.error(error.response?.data?.mensaje || 'Error al cargar los planes');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPlanes();
  }, []);

  const abrirModal = (plan?: Plan) => {
    if (plan) {
      setPlanEditando(plan);
      setFormData({
        nombre: plan.nombre,
        descripcion: plan.descripcion || '',
        precio: plan.precio.toString(),
        duracionDias: plan.duracionDias.toString(),
        estado: plan.estado,
      });
    } else {
      setPlanEditando(null);
      setFormData({ nombre: '', descripcion: '', precio: '', duracionDias: '', estado: 'Activo' });
    }
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setPlanEditando(null);
  };

  const guardarPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.precio || !formData.duracionDias) {
      toast.error('Complete los campos obligatorios');
      return;
    }

    try {
      setGuardando(true);
      const payload = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: Number(formData.precio),
        duracionDias: Number(formData.duracionDias),
        estado: formData.estado,
      };

      if (planEditando) {
        await actualizarPlan(planEditando.id, payload);
        toast.success('Plan actualizado');
      } else {
        await crearPlan(payload);
        toast.success('Plan creado');
      }
      cerrarModal();
      cargarPlanes();
    } catch (error: any) {
      toast.error(error.response?.data?.mensaje || 'Error al guardar el plan');
    } finally {
      setGuardando(false);
    }
  };

  const borrarPlan = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este plan?')) return;
    try {
      await eliminarPlan(id);
      toast.success('Plan eliminado');
      cargarPlanes();
    } catch (error: any) {
      toast.error(
        error.response?.data?.mensaje || 'Error al eliminar. Puede que tenga membresías asociadas.',
      );
    }
  };
  const paginacion = useTablePagination(planes);
  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto text-gray-900 space-y-5 min-h-[calc(100dvh-10rem)] flex flex-col">
      <div className="bg-gradient-to-r from-white via-white to-yellow-50/60 p-4 md:px-5 rounded-xl border border-yellow-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 bg-yellow-50 rounded-lg border border-yellow-200 text-[#c89500] shadow-sm">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 tracking-wide">Planes y Precios</h1>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Administra las tarifas y opciones de membresía.
            </p>
          </div>
        </div>
        {permisos.crear && <button
          onClick={() => abrirModal()}
          className="w-full sm:w-auto px-4 py-2 bg-[#e6b010] hover:bg-[#d5a20a] text-gray-950 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
        >
          <Plus className="w-3.5 h-3.5" /> Nuevo Plan
        </button>}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex min-h-[400px] flex-1 flex-col">
        {cargando ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-[#e6b010]" />
          </div>
        ) : planes.length === 0 ? (
          <div className="py-14 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mb-3 border border-gray-100">
              <Tag className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">Aún no hay planes registrados</h3>
            <p className="text-xs text-gray-500">Crea tu primer plan de membresía para empezar.</p>
          </div>
        ) : (
          <>
          <div className="overflow-x-auto flex-1">
            <table className="membership-data-table w-full table-fixed text-left border-collapse">
              <colgroup>
                <col className="w-[34%]" />
                <col className="w-[18%]" />
                <col className="w-[16%]" />
                <col className="w-[16%]" />
                <col className="w-[16%]" />
              </colgroup>
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Nombre del Plan</th>
                  <th className="py-2.5 px-4 text-center">Duración</th>
                  <th className="py-2.5 px-4 text-center">Precio</th>
                  <th className="py-2.5 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {paginacion.rows.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-2.5 px-4">
                      <p className="font-bold text-gray-900">{plan.nombre}</p>
                      {plan.descripcion && (
                        <p className="text-[10px] text-gray-500 truncate max-w-xs">
                          {plan.descripcion}
                        </p>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-center text-gray-600">
                      {plan.duracionDias} días
                    </td>
                    <td className="py-2.5 px-4 text-center font-semibold text-gray-900">
                      S/ {Number(plan.precio).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          plan.estado === 'Activo'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}
                      >
                        {plan.estado}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {permisos.editar && <button
                          onClick={() => abrirModal(plan)}
                          className="p-1.5 text-gray-500 hover:text-[#e6b010] hover:bg-yellow-50 rounded-md transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>}
                        {permisos.eliminar && <button
                          onClick={() => borrarPlan(plan.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TablePagination {...paginacion} />
          </>
        )}
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-900">
                {planEditando ? 'Editar Plan' : 'Nuevo Plan'}
              </h3>
              <button onClick={cerrarModal} className="text-gray-400 hover:text-gray-700 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={guardarPlan} className="p-4 space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-gray-900"
                  placeholder="Ej. Plan Mensual Básico"
                />
              </div>

              <div className="flex gap-3">
                <div className="w-1/2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Precio (S/) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.10"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-gray-900"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Duración (Días) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.duracionDias}
                    onChange={(e) => setFormData({ ...formData, duracionDias: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-gray-900 resize-none"
                  placeholder="Detalles del plan..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Estado
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-gray-900"
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="px-4 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-xs font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-4 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  {guardando && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {planEditando ? 'Guardar Cambios' : 'Crear Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
