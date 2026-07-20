import { useState, useEffect, useMemo } from 'react';
import { Search, Loader2, Users, UserPlus, X, Save, Trash2, Mail, Phone, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { obtenerMiembros, crearCliente, inactivarCliente } from '../../services/miembros.service';

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [buscar, setBuscar] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const estadoInicial = { nombres: '', apellidos: '', dni: '', email: '', telefono: '' };
  const [formData, setFormData] = useState(estadoInicial);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const data = await obtenerMiembros();
      setClientes(data);
    } catch (err) {
      console.error("Error al cargar clientes:", err);
    }
    setCargando(false);
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await crearCliente(formData);
      setIsModalOpen(false);
      setFormData(estadoInicial);
      cargarDatos();
      toast.success('Cliente registrado exitosamente');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleInactivar = async (id: number, nombre: string) => {
    const confirmar = window.confirm(`¿Estás seguro de que deseas eliminar a ${nombre} del sistema? (Sus pagos históricos se mantendrán)`);
    if (!confirmar) return;
    
    try {
      await inactivarCliente(id);
      cargarDatos();
      toast.success('Cliente eliminado correctamente');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const clientesFiltrados = useMemo(() => {
    return clientes.filter(c => {
      const term = buscar.toLowerCase();
      return (
        c.nombres.toLowerCase().includes(term) ||
        c.apellidos.toLowerCase().includes(term) ||
        c.dni.includes(term)
      );
    });
  }, [clientes, buscar]);

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto text-gray-900">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 shadow-sm">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Directorio de Clientes</h1>
            <p className="text-sm text-gray-500 mt-0.5">Gestión general de personas registradas en el gimnasio.</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#e6b010] hover:bg-[#d4a00e] text-white font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          <UserPlus className="w-4 h-4" /> Registrar Cliente
        </button>
      </div>

      {/* BUSCADOR Y ESTADÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100"><Users className="w-5 h-5 text-blue-600" /></div>
          <div>
            <p className="text-2xl font-bold text-gray-900 leading-none">{clientesFiltrados.length}</p>
            <p className="text-xs text-gray-500 mt-1">Total Registrados</p>
          </div>
        </div>
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, apellidos o DNI..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            className="w-full h-full bg-white border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-sm text-gray-900 focus:border-[#e6b010] focus:ring-2 focus:ring-[#e6b010]/20 outline-none transition-all placeholder-gray-400 shadow-sm"
          />
        </div>
      </div>

      {/* TABLA DE CLIENTES */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200">
                <th className="p-5 pl-6">Cliente</th>
                <th className="p-5">Contacto</th>
                <th className="p-5 text-center">Estado Comercial</th>
                <th className="p-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {cargando ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#e6b010]" /> Cargando directorio...
                  </td>
                </tr>
              ) : clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-gray-500">
                    No se encontraron clientes registrados.
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((c) => {
                  const tieneMembresia = c.membresias && c.membresias.length > 0;
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 font-bold text-gray-600 text-xs shrink-0">
                            {c.nombres.charAt(0)}{c.apellidos.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{c.nombres} {c.apellidos}</p>
                            <p className="text-xs text-gray-500 font-medium">DNI: {c.dni}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-gray-700 mb-1">
                          <Phone className="w-3 h-3 text-gray-400" /> 
                          <span className="text-xs">{c.telefono || 'Sin teléfono'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span className="text-xs">{c.email || 'Sin correo'}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {tieneMembresia ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-green-50 text-green-600 border border-green-200">
                            Con Plan Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                            Solo Registro
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => handleInactivar(c.id, c.nombres)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Inactivar / Eliminar"
                        >
                          <Trash2 className="w-5 h-5" />
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

      {/* MODAL PARA CREAR CLIENTE (SIN PLAN) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">Registrar Persona</h2>
                <p className="text-xs text-gray-500 mt-1">Añade a un cliente a la agenda del gimnasio.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-xl transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex gap-3 text-blue-800 text-xs mb-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <p>Al registrar aquí, el cliente <b>no tendrá membresía activa</b>. Luego ve a "Miembros Activos" para asignarle un plan buscándolo por su DNI.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Nombres *</label>
                  <input required value={formData.nombres} onChange={(e) => setFormData({ ...formData, nombres: e.target.value })} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#e6b010] focus:ring-2 focus:ring-[#e6b010]/20" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Apellidos *</label>
                  <input required value={formData.apellidos} onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#e6b010] focus:ring-2 focus:ring-[#e6b010]/20" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">DNI *</label>
                <input required maxLength={15} value={formData.dni} onChange={(e) => setFormData({ ...formData, dni: e.target.value })} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#e6b010] focus:ring-2 focus:ring-[#e6b010]/20" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Teléfono</label>
                  <input value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#e6b010] focus:ring-2 focus:ring-[#e6b010]/20" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Correo Electrónico</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#e6b010] focus:ring-2 focus:ring-[#e6b010]/20" />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all">Cancelar</button>
                <button type="submit" disabled={guardando} className="flex items-center gap-2 px-6 py-2.5 bg-[#e6b010] hover:bg-[#d4a00e] text-white font-bold text-sm rounded-xl shadow-md disabled:opacity-70 transition-all">
                  {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {guardando ? 'Guardando...' : 'Guardar Persona'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}