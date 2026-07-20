import { useState, useEffect, useMemo } from 'react';
import { Search, Loader2, Clock, Tag, Save, X, CalendarCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { obtenerMiembros, renovarMembresia } from '../../services/miembros.service';
import { obtenerPlanes } from '../../services/planes.service';

export default function RenovacionesPage() {
  const [miembros, setMiembros] = useState<any[]>([]);
  const [planes, setPlanes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [buscar, setBuscar] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<any>(null);
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState({ planId: '', fechaInicio: new Date().toISOString().split('T')[0] });

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const dataPlanes = await obtenerPlanes();
      setPlanes(dataPlanes.filter((p: any) => p.estado?.toLowerCase() === 'activo'));
    } catch (err) { }
    try {
      const dataMiembros = await obtenerMiembros();
      setMiembros(dataMiembros);
    } catch (err) { }
    setCargando(false);
  };

  useEffect(() => { cargarDatos(); }, []);

  const calcularDiasRestantes = (fechaFin: string) => {
    const fin = new Date(fechaFin).getTime();
    const hoy = new Date().getTime();
    return Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24));
  };

  const proximosAVencer = useMemo(() => {
    return miembros.filter(m => {
      const ultimaMembresia = m.membresias?.[0];
      if (!ultimaMembresia) return false;
      const diasRestantes = calcularDiasRestantes(ultimaMembresia.fechaFin);

      if (diasRestantes < 0 || diasRestantes > 7) return false;

      const term = buscar.toLowerCase();
      return m.nombres.toLowerCase().includes(term) || m.apellidos.toLowerCase().includes(term) || m.dni.includes(term);
    });
  }, [miembros, buscar]);

  const handleSubmitRenovacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await renovarMembresia(clienteSeleccionado.id, formData);
      setIsModalOpen(false);
      setFormData({ planId: '', fechaInicio: new Date().toISOString().split('T')[0] });
      cargarDatos();
      toast.success('Membresía renovada con éxito');
    } catch (error) {
      toast.error('Error al renovar la membresía.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto text-gray-900">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 bg-white p-6 rounded-2xl border border-orange-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 shadow-sm">
            <Clock className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Próximos a Vencer</h1>
            <p className="text-sm text-gray-500 mt-0.5">Membresías que caducan en los próximos 7 días.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-xl bg-orange-50 border border-orange-100"><Clock className="w-5 h-5 text-orange-500" /></div>
          <div>
            <p className="text-2xl font-bold text-gray-900 leading-none">{proximosAVencer.length}</p>
            <p className="text-xs text-gray-500 mt-1">Requieren Renovación</p>
          </div>
        </div>
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, apellidos o DNI..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            className="w-full h-full bg-white border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-sm outline-none focus:border-[#e6b010] focus:ring-2 focus:ring-[#e6b010]/20 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200">
                <th className="p-5 pl-6">Cliente</th>
                <th className="p-5">Último Plan</th>
                <th className="p-5 text-center">Fecha Vencimiento</th>
                <th className="p-5 text-center">Vence En</th>
                <th className="p-5 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {cargando ? (
                <tr><td colSpan={5} className="p-12 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#e6b010]" /> Cargando datos...</td></tr>
              ) : proximosAVencer.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-gray-500">No hay membresías próximas a vencer (0 a 7 días).</td></tr>
              ) : (
                proximosAVencer.map((m) => {
                  const membresia = m.membresias[0];
                  const diasRestantes = calcularDiasRestantes(membresia.fechaFin);
                  const fechaFin = new Date(membresia.fechaFin).toLocaleDateString('es-PE');

                  return (
                    <tr key={m.id} className="hover:bg-orange-50/30 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100 font-bold text-orange-600 text-xs shrink-0">
                            {m.nombres.charAt(0)}{m.apellidos.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{m.nombres} {m.apellidos}</p>
                            <p className="text-xs text-gray-500 font-medium">Telf: {m.telefono || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-gray-800">{membresia.plan.nombre}</p>
                      </td>
                      <td className="p-4 text-center text-gray-600 font-medium">{fechaFin}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex px-3 py-1 text-[11px] font-bold rounded-full border ${diasRestantes === 0 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
                          {diasRestantes === 0 ? '¡Vence Hoy!' : `${diasRestantes} días`}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button onClick={() => { setClienteSeleccionado(m); setIsModalOpen(true); }} className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-all shadow-sm">
                          Renovar Adelantado
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL IDÉNTICO AL DE VENCIDAS... */}
      {isModalOpen && clienteSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">Renovación Anticipada</h2>
                <p className="text-xs text-gray-500 mt-1">Cliente: {clienteSeleccionado.nombres} {clienteSeleccionado.apellidos}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-xl transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitRenovacion} className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Nuevo Plan a Asignar *</label>
                <div className="relative">
                  <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select required value={formData.planId} onChange={(e) => setFormData({ ...formData, planId: e.target.value })} className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-10 pr-4 text-sm font-medium outline-none focus:border-[#e6b010] focus:ring-2 focus:ring-[#e6b010]/20">
                    <option value="">-- Seleccionar --</option>
                    {planes.map(p => <option key={p.id} value={p.id}>{p.nombre} (S/ {p.precio})</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Fecha de Inicio de Renovación *</label>
                <div className="relative">
                  <CalendarCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input required type="date" value={formData.fechaInicio} onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })} className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-[#e6b010] focus:ring-2 focus:ring-[#e6b010]/20" />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all">Cancelar</button>
                <button type="submit" disabled={guardando} className="flex items-center gap-2 px-6 py-2.5 bg-[#e6b010] hover:bg-[#d4a00e] text-white font-bold text-sm rounded-xl shadow-md disabled:opacity-70 transition-all">
                  {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {guardando ? 'Procesando...' : 'Confirmar Pago'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}