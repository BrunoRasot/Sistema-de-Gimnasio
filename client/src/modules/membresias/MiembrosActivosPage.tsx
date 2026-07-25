import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Loader2, UserCheck, CalendarCheck, Tag, X, Save, AlertCircle, Dumbbell } from 'lucide-react';
import toast from 'react-hot-toast';
import { obtenerMiembros, buscarClienteDni, asignarMembresia } from '../../services/miembros.service';
import { obtenerPlanes } from '../../services/planes.service';

export default function MiembrosActivosPage() {
  const [miembros, setMiembros] = useState<any[]>([]);
  const [planes, setPlanes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [buscar, setBuscar] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [dniBusqueda, setDniBusqueda] = useState('');
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [clienteEncontrado, setClienteEncontrado] = useState<any>(null);

  const estadoInicial = {
    miembroId: '',
    planId: '',
    fechaInicio: new Date().toISOString().split('T')[0]
  };
  const [formData, setFormData] = useState(estadoInicial);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const dataPlanes = await obtenerPlanes();
      const planesActivos = dataPlanes.filter((p: any) => p.estado?.toLowerCase() === 'activo');
      setPlanes(planesActivos);

      const dataMiembros = await obtenerMiembros();
      setMiembros(dataMiembros);
    } catch (err) {
      console.error("Error al cargar datos:", err);
    }
    setCargando(false);
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleBuscarDni = async () => {
    if (dniBusqueda.length < 8) return;
    setBuscandoCliente(true);
    try {
      const data = await buscarClienteDni(dniBusqueda);
      setClienteEncontrado(data);
      setFormData({ ...formData, miembroId: data.id });
    } catch (error: any) {
      toast.error(error.message);
      setClienteEncontrado(null);
      setFormData({ ...formData, miembroId: '' });
    } finally {
      setBuscandoCliente(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteEncontrado) {
      toast.error("Debes buscar y seleccionar un cliente primero.");
      return;
    }

    setGuardando(true);
    try {
      await asignarMembresia(formData);
      setIsModalOpen(false);
      setFormData(estadoInicial);
      setClienteEncontrado(null);
      setDniBusqueda('');
      cargarDatos();
      toast.success('Membresía asignada con éxito');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setGuardando(false);
    }
  };

  const calcularDiasRestantes = (fechaFin: string) => {
    const fin = new Date(fechaFin).getTime();
    const hoy = new Date().getTime();
    return Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24));
  };

  const miembrosActivos = useMemo(() => {
    return miembros.filter(m => {
      const ultimaMembresia = m.membresias?.[0];
      if (!ultimaMembresia) return false;
      const diasRestantes = calcularDiasRestantes(ultimaMembresia.fechaFin);
      if (diasRestantes < 0) return false;

      const term = buscar.toLowerCase();
      return (
        m.nombres.toLowerCase().includes(term) ||
        m.apellidos.toLowerCase().includes(term) ||
        m.dni.includes(term)
      );
    });
  }, [miembros, buscar]);

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-4 text-gray-900">

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 bg-yellow-50 rounded-lg border border-yellow-100 text-[#e6b010]">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 tracking-wide">Miembros Activos</h1>
            <p className="text-[11px] text-gray-500 mt-0.5">Clientes con planes de membresía vigentes.</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2 bg-[#141414] hover:bg-black text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> Inscribir Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="p-2.5 rounded-lg bg-green-50 border border-green-100"><UserCheck className="w-4 h-4 text-green-600" /></div>
          <div>
            <p className="text-xl font-bold text-gray-900 leading-none">{miembrosActivos.length}</p>
            <p className="text-[11px] text-gray-500 mt-1">Clientes Activos</p>
          </div>
        </div>
        <div className="md:col-span-2 relative flex items-center">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar cliente por nombre, apellidos o DNI..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            className="w-full h-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-xs text-gray-900 focus:border-[#e6b010] focus:ring-1 focus:ring-[#e6b010] outline-none transition-all placeholder-gray-400 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <th className="py-3 px-4 pl-5">Cliente</th>
                <th className="py-3 px-4">Contacto</th>
                <th className="py-3 px-4">Plan Actual</th>
                <th className="py-3 px-4 text-center">Vencimiento</th>
                <th className="py-3 px-4 text-center pr-5">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {cargando ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#e6b010]" /> Cargando datos...
                  </td>
                </tr>
              ) : miembrosActivos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-gray-500">
                    No se encontraron clientes activos.
                  </td>
                </tr>
              ) : (
                miembrosActivos.map((m) => {
                  const membresia = m.membresias[0];
                  const diasRestantes = calcularDiasRestantes(membresia.fechaFin);
                  const fechaFinFormateada = new Date(membresia.fechaFin).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });

                  return (
                    <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 pl-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 font-bold text-gray-600 text-[10px] shrink-0">
                            {m.nombres.charAt(0)}{m.apellidos.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{m.nombres} {m.apellidos}</p>
                            <p className="text-[10px] text-gray-500 font-medium">DNI: {m.dni}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-gray-900">{m.telefono || 'Sin teléfono'}</p>
                        <p className="text-[10px] text-gray-500">{m.email || 'Sin correo'}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-gray-800">
                          <Tag className="w-3.5 h-3.5 text-[#e6b010]" />
                          {membresia.plan.nombre}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <p className="text-gray-900 font-bold">{fechaFinFormateada}</p>
                        <p className={`text-[10px] font-semibold mt-0.5 ${diasRestantes <= 5 ? 'text-red-500' : 'text-gray-500'}`}>
                          Faltan {diasRestantes} d
                        </p>
                      </td>
                      <td className="py-3 px-4 text-center pr-5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-green-50 text-green-700 border border-green-200">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Activo
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white border border-gray-200 rounded-xl shadow-xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Inscribir Cliente</h2>
                <p className="text-[11px] text-gray-500">Busca el DNI del cliente y asígnale su membresía.</p>
              </div>
              <button onClick={() => { setIsModalOpen(false); setClienteEncontrado(null); setDniBusqueda(''); }} className="p-1 text-gray-400 hover:text-gray-700 rounded-lg transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#e6b010]" /> Buscar Cliente
                </h3>

                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">DNI del Cliente *</label>
                    <input
                      type="text"
                      maxLength={15}
                      value={dniBusqueda}
                      onChange={(e) => setDniBusqueda(e.target.value)}
                      placeholder="Ingrese DNI..."
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-gray-900"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleBuscarDni}
                    disabled={buscandoCliente || dniBusqueda.length < 8}
                    className="px-4 py-1.5 bg-gray-900 text-white font-medium rounded-lg text-xs hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center gap-1.5"
                  >
                    {buscandoCliente ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />} Buscar
                  </button>
                </div>

                {clienteEncontrado && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 mt-2">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-green-200 font-bold text-green-700 text-[10px] shrink-0">
                      {clienteEncontrado.nombres.charAt(0)}{clienteEncontrado.apellidos.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-green-900">{clienteEncontrado.nombres} {clienteEncontrado.apellidos}</p>
                      <p className="text-[10px] text-green-700">DNI: {clienteEncontrado.dni} | {clienteEncontrado.telefono || 'Sin teléfono'}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
                  <Dumbbell className="w-3.5 h-3.5 text-[#e6b010]" /> Asignación de Plan
                </h3>

                {planes.length === 0 ? (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg flex gap-2 text-orange-800 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p>No tienes planes activos registrados. Crea un plan primero.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Seleccionar Plan *</label>
                      <select required value={formData.planId} onChange={(e) => setFormData({ ...formData, planId: e.target.value })} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-gray-900 font-medium">
                        <option value="">-- Elige un plan --</option>
                        {planes.map(p => (
                          <option key={p.id} value={p.id}>{p.nombre} (S/ {p.precio})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Fecha de Inicio *</label>
                      <div className="relative">
                        <CalendarCheck className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input required type="date" value={formData.fechaInicio} onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })} className="w-full bg-white border border-gray-200 rounded-lg py-1.5 pl-8 pr-3 text-xs outline-none focus:border-gray-900" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-gray-100 mt-4">
                <button type="button" onClick={() => { setIsModalOpen(false); setClienteEncontrado(null); setDniBusqueda(''); }} className="px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-all">Cancelar</button>

                <button type="submit" disabled={guardando || !clienteEncontrado || planes.length === 0} className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-900 hover:bg-gray-800 text-white font-medium text-xs rounded-lg shadow-sm disabled:opacity-70 transition-all">
                  {guardando && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <Save className="w-3.5 h-3.5" />
                  {guardando ? 'Inscribiendo...' : 'Inscribir Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}