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
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto text-gray-900">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-xl border border-green-100 shadow-sm">
            <UserCheck className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Miembros Activos</h1>
            <p className="text-sm text-gray-500 mt-0.5">Clientes con planes de membresía vigentes.</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#e6b010] hover:bg-[#d4a00e] text-white font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Inscribir Cliente
        </button>
      </div>

      {/* Tarjetas de estadísticas y buscador */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-xl bg-green-50 border border-green-100"><UserCheck className="w-5 h-5 text-green-600" /></div>
          <div>
            <p className="text-2xl font-bold text-gray-900 leading-none">{miembrosActivos.length}</p>
            <p className="text-xs text-gray-500 mt-1">Clientes Activos</p>
          </div>
        </div>
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar cliente por nombre, apellidos o DNI..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            className="w-full h-full bg-white border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-sm text-gray-900 focus:border-[#e6b010] focus:ring-2 focus:ring-[#e6b010]/20 outline-none transition-all placeholder-gray-400 shadow-sm"
          />
        </div>
      </div>

      {/* Tabla de Activos */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200">
                <th className="p-5 pl-6">Cliente</th>
                <th className="p-5">Contacto</th>
                <th className="p-5">Plan Actual</th>
                <th className="p-5 text-center">Vencimiento</th>
                <th className="p-5 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {cargando ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#e6b010]" /> Cargando datos...
                  </td>
                </tr>
              ) : miembrosActivos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    No se encontraron clientes activos.
                  </td>
                </tr>
              ) : (
                miembrosActivos.map((m) => {
                  const membresia = m.membresias[0];
                  const diasRestantes = calcularDiasRestantes(membresia.fechaFin);
                  const fechaFinFormateada = new Date(membresia.fechaFin).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });

                  return (
                    <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 font-bold text-gray-600 text-xs shrink-0">
                            {m.nombres.charAt(0)}{m.apellidos.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{m.nombres} {m.apellidos}</p>
                            <p className="text-xs text-gray-500 font-medium">DNI: {m.dni}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-gray-900">{m.telefono || 'Sin teléfono'}</p>
                        <p className="text-xs text-gray-500">{m.email || 'Sin correo'}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-medium text-gray-800">
                          <Tag className="w-4 h-4 text-[#e6b010]" />
                          {membresia.plan.nombre}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <p className="text-gray-900 font-bold">{fechaFinFormateada}</p>
                        <p className={`text-xs font-semibold mt-0.5 ${diasRestantes <= 5 ? 'text-red-500' : 'text-gray-500'}`}>
                          Faltan {diasRestantes} d
                        </p>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-green-50 text-green-600 border border-green-200">
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

      {/* MODAL PARA JALAR CLIENTE E INSCRIBIR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">Inscribir Cliente</h2>
                <p className="text-xs text-gray-500 mt-1">Busca el DNI del cliente y asígnale su membresía.</p>
              </div>
              <button onClick={() => { setIsModalOpen(false); setClienteEncontrado(null); setDniBusqueda(''); }} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-xl transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* SECCIÓN 1: BUSCAR CLIENTE */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
                  <UserCheck className="w-4 h-4 text-[#e6b010]" /> Buscar Cliente
                </h3>
                
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">DNI del Cliente *</label>
                    <input 
                      type="text" 
                      maxLength={15} 
                      value={dniBusqueda} 
                      onChange={(e) => setDniBusqueda(e.target.value)} 
                      placeholder="Ingrese DNI para buscar..."
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#e6b010] focus:ring-2 focus:ring-[#e6b010]/20" 
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={handleBuscarDni}
                    disabled={buscandoCliente || dniBusqueda.length < 8}
                    className="px-5 py-2.5 bg-gray-900 text-white font-bold rounded-xl text-sm hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {buscandoCliente ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Buscar
                  </button>
                </div>

                {/* Resultado de búsqueda */}
                {clienteEncontrado && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-4 mt-2">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-green-200 font-bold text-green-700 text-xs shrink-0">
                      {clienteEncontrado.nombres.charAt(0)}{clienteEncontrado.apellidos.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-green-900">{clienteEncontrado.nombres} {clienteEncontrado.apellidos}</p>
                      <p className="text-xs text-green-700">DNI: {clienteEncontrado.dni} | {clienteEncontrado.telefono || 'Sin teléfono'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* SECCIÓN 2: ASIGNAR PLAN */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
                  <Dumbbell className="w-4 h-4 text-[#e6b010]" /> Asignación de Plan
                </h3>

                {planes.length === 0 ? (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl flex gap-3 text-orange-800 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>No tienes planes activos registrados. Por favor, crea un plan primero.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Seleccionar Plan *</label>
                      <select required value={formData.planId} onChange={(e) => setFormData({ ...formData, planId: e.target.value })} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#e6b010] focus:ring-2 focus:ring-[#e6b010]/20 font-medium">
                        <option value="">-- Elige un plan --</option>
                        {planes.map(p => (
                          <option key={p.id} value={p.id}>{p.nombre} (S/ {p.precio})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Fecha de Inicio *</label>
                      <div className="relative">
                        <CalendarCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input required type="date" value={formData.fechaInicio} onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })} className="w-full bg-white border border-gray-300 rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#e6b010] focus:ring-2 focus:ring-[#e6b010]/20" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => { setIsModalOpen(false); setClienteEncontrado(null); setDniBusqueda(''); }} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all">Cancelar</button>
                
                <button type="submit" disabled={guardando || !clienteEncontrado || planes.length === 0} className="flex items-center gap-2 px-6 py-2.5 bg-[#e6b010] hover:bg-[#d4a00e] text-white font-bold text-sm rounded-xl shadow-md disabled:opacity-70 transition-all">
                  {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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