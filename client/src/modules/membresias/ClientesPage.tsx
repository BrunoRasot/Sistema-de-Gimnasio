import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Loader2,
  Users,
  UserPlus,
  X,
  Save,
  Trash2,
  Mail,
  Phone,
  ShieldAlert,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ListFilter,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { obtenerMiembros, crearCliente, inactivarCliente } from '../../services/miembros.service';

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [buscar, setBuscar] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [orden, setOrden] = useState<'asc' | 'desc'>('asc');
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);
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
      console.error('Error al cargar clientes:', err);
    }
    setCargando(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

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
      toast.error(error.response?.data?.mensaje || 'No se pudo registrar al cliente.');
    } finally {
      setGuardando(false);
    }
  };

  const handleInactivar = async (id: number, nombre: string) => {
    const confirmar = window.confirm(
      `¿Estás seguro de que deseas eliminar a ${nombre} del sistema? (Sus pagos históricos se mantendrán)`,
    );
    if (!confirmar) return;

    try {
      await inactivarCliente(id);
      cargarDatos();
      toast.success('Cliente eliminado correctamente');
    } catch (error: any) {
      toast.error(error.response?.data?.mensaje || 'No se pudo eliminar al cliente.');
    }
  };

  const clientesFiltrados = useMemo(() => {
    return clientes.filter((c) => {
      const term = buscar.toLowerCase();
      const coincideBusqueda = (
        c.nombres.toLowerCase().includes(term) ||
        c.apellidos.toLowerCase().includes(term) ||
        c.dni.includes(term)
      );
      const tieneMembresia = Boolean(c.membresias?.length);
      const coincideEstado = filtroEstado === 'todos' || (filtroEstado === 'con-plan' ? tieneMembresia : !tieneMembresia);
      return coincideBusqueda && coincideEstado;
    }).sort((a, b) => {
      const nombreA = `${a.apellidos} ${a.nombres}`.toLocaleLowerCase('es');
      const nombreB = `${b.apellidos} ${b.nombres}`.toLocaleLowerCase('es');
      return orden === 'asc' ? nombreA.localeCompare(nombreB) : nombreB.localeCompare(nombreA);
    });
  }, [clientes, buscar, filtroEstado, orden]);

  const totalPaginas = Math.max(1, Math.ceil(clientesFiltrados.length / porPagina));
  const inicio = (pagina - 1) * porPagina;
  const clientesPaginados = clientesFiltrados.slice(inicio, inicio + porPagina);

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-5 text-gray-900 min-h-[calc(100dvh-10rem)] flex flex-col">
      <div className="bg-gradient-to-r from-white via-white to-yellow-50/60 p-4 md:px-5 rounded-xl border border-yellow-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 bg-yellow-50 rounded-lg border border-yellow-200 text-[#c89500] shadow-sm">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 tracking-wide">
              Directorio de Clientes
            </h1>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Gestión general de personas registradas en el gimnasio.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2 bg-[#e6b010] hover:bg-[#d5a20a] text-gray-950 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
        >
          <UserPlus className="w-3.5 h-3.5" /> Registrar Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100">
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900 leading-none">
              {clientesFiltrados.length}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">Total Registrados</p>
          </div>
        </div>
        <div className="md:col-span-2 relative flex items-center">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, apellidos o DNI..."
            value={buscar}
            onChange={(e) => { setBuscar(e.target.value); setPagina(1); }}
            className="w-full h-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-xs text-gray-900 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all placeholder-gray-400 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px] flex flex-1 flex-col">
        <div className="flex flex-col gap-2 border-b border-gray-200 bg-gray-50/70 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <ListFilter className="h-3.5 w-3.5 text-gray-400" />
            <select
              aria-label="Filtrar por estado comercial"
              value={filtroEstado}
              onChange={(event) => { setFiltroEstado(event.target.value); setPagina(1); }}
              className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] text-gray-700 outline-none focus:border-[#e6b010]"
            >
              <option value="todos">Todos los estados</option>
              <option value="con-plan">Con plan activo</option>
              <option value="sin-plan">Solo registro</option>
            </select>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-500">
            <span>Filas por página</span>
            <select
              aria-label="Filas por página"
              value={porPagina}
              onChange={(event) => { setPorPagina(Number(event.target.value)); setPagina(1); }}
              className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-[11px] text-gray-700 outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="membership-data-table w-full table-fixed text-left border-collapse min-w-[1000px]">
            <colgroup>
              <col className="w-[34%]" />
              <col className="w-[30%]" />
              <col className="w-[22%]" />
              <col className="w-[14%]" />
            </colgroup>
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <th className="py-3 px-4 pl-5">
                  <button type="button" onClick={() => setOrden(orden === 'asc' ? 'desc' : 'asc')} className="flex items-center gap-1.5 hover:text-gray-900">
                    Cliente <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="py-3 px-4">Contacto</th>
                <th className="py-3 px-4 text-center">Estado Comercial</th>
                <th className="py-3 px-4 text-center pr-5">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {cargando ? (
                <tr>
                  <td colSpan={4} className="py-14 text-center text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#e6b010]" />{' '}
                    Cargando directorio...
                  </td>
                </tr>
              ) : clientesPaginados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-14 text-center text-gray-500">
                    <Users className="mx-auto mb-2 h-6 w-6 text-gray-300" />
                    <p className="font-medium text-gray-700">No se encontraron clientes</p>
                    <p className="mt-1 text-[10px] text-gray-400">Prueba con otro término o cambia el filtro.</p>
                  </td>
                </tr>
              ) : (
                clientesPaginados.map((c) => {
                  const tieneMembresia = c.membresias && c.membresias.length > 0;
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 pl-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 font-bold text-gray-600 text-[10px] shrink-0">
                            {c.nombres.charAt(0)}
                            {c.apellidos.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">
                              {c.nombres} {c.apellidos}
                            </p>
                            <p className="text-[10px] text-gray-500 font-medium">DNI: {c.dni}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-gray-700 mb-0.5">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span className="text-[11px]">{c.telefono || 'Sin teléfono'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span className="text-[11px]">{c.email || 'Sin correo'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {tieneMembresia ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-green-50 text-green-700 border border-green-200">
                            Con Plan Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-gray-100 text-gray-600 border border-gray-200">
                            Solo Registro
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center pr-5">
                        <button
                          onClick={() => handleInactivar(c.id, c.nombres)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                          title="Inactivar / Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!cargando && clientesFiltrados.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-gray-200 bg-white px-4 py-2.5 text-[10px] text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Mostrando {inicio + 1}–{Math.min(inicio + porPagina, clientesFiltrados.length)} de {clientesFiltrados.length} registros
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label="Página anterior"
                disabled={pagina === 1}
                onClick={() => setPagina((actual) => Math.max(1, actual - 1))}
                className="rounded-md border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-16 text-center font-medium text-gray-700">Página {pagina} de {totalPaginas}</span>
              <button
                type="button"
                aria-label="Página siguiente"
                disabled={pagina >= totalPaginas}
                onClick={() => setPagina((actual) => Math.min(totalPaginas, actual + 1))}
                className="rounded-md border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white border border-gray-200 rounded-xl shadow-xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Registrar Persona</h2>
                <p className="text-[11px] text-gray-500">
                  Añade a un cliente a la agenda del gimnasio.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex gap-2.5 text-blue-900 text-xs">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
                <p>
                  Al registrar aquí, el cliente <b>no tendrá membresía activa</b>. Luego ve a
                  "Miembros Activos" para asignarle un plan buscándolo por su DNI.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Nombres *
                  </label>
                  <input
                    required
                    value={formData.nombres}
                    onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Apellidos *
                  </label>
                  <input
                    required
                    value={formData.apellidos}
                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  DNI *
                </label>
                <input
                  required
                  maxLength={15}
                  value={formData.dni}
                  onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Teléfono
                  </label>
                  <input
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-gray-900"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-gray-100 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardando}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-900 hover:bg-gray-800 text-white font-medium text-xs rounded-lg shadow-sm disabled:opacity-70 transition-all"
                >
                  {guardando && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <Save className="w-3.5 h-3.5" />
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
