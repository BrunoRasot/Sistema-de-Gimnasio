import { useState, useEffect, useMemo } from 'react';
import { Search, RefreshCw, Edit2, ShieldX, Eye, ShieldCheck, Loader2, AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { obtenerUsuarios, actualizarUsuario } from '../../services/usuarios.service';
import { Usuario } from '../../types/usuario';
import { UsuarioModal } from './UsuarioModal';

export default function AdministradoresPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [buscar, setBuscar] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [modoVista, setModoVista] = useState(false);
  
  const [modalConfirmacion, setModalConfirmacion] = useState<{
    isOpen: boolean;
    id: number | null;
    nombre: string;
    procesando: boolean;
  }>({
    isOpen: false,
    id: null,
    nombre: '',
    procesando: false
  });

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const data = await obtenerUsuarios({ rol: 'ADMIN' });
      setUsuarios(data.usuarios);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar la lista de administradores');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const ejecutarRevocacion = async () => {
    if (!modalConfirmacion.id) return;
    
    setModalConfirmacion(prev => ({ ...prev, procesando: true }));
    try {
      await actualizarUsuario(modalConfirmacion.id, { rol: 'USER' });
      toast.success(`Privilegios revocados. ${modalConfirmacion.nombre} ahora es usuario estándar.`);
      cargarDatos();
      setModalConfirmacion({ isOpen: false, id: null, nombre: '', procesando: false });
    } catch (error) {
      console.error(error);
      toast.error('Ocurrió un error al intentar revocar los privilegios.');
      setModalConfirmacion(prev => ({ ...prev, procesando: false }));
    }
  };

  const administradoresFiltrados = useMemo(() => {
    const term = buscar.trim().toLowerCase();
    if (!term) return usuarios;
    return usuarios.filter((u) =>
      u.nombreUsuario?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.dni?.toLowerCase().includes(term) ||
      `${u.nombres ?? ''} ${u.apellidos ?? ''}`.toLowerCase().includes(term)
    );
  }, [usuarios, buscar]);

  return (
    <div className="p-6 max-w-[1600px] mx-auto text-gray-900">
      
      {/* HEADER Y MÉTRICAS (Mismo código que ya tenías) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-100">
            <ShieldCheck className="w-6 h-6 text-[#e6b010]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-wide">Administradores</h1>
            <p className="text-sm text-gray-500 mt-1">Supervisa las cuentas con acceso total al sistema.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={cargarDatos} className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-900 transition-all border border-gray-200">
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar administrador por nombre, DNI, usuario o email..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-11 pr-4 text-sm text-gray-900 focus:border-[#e6b010] focus:ring-1 focus:ring-[#e6b010] outline-none transition-all shadow-sm"
        />
      </div>

      {/* TABLA DE ADMINISTRADORES */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200">
                <th className="p-5 pl-6">Administrador</th>
                <th className="p-5">Identificación</th>
                <th className="p-5">Contacto</th>
                <th className="p-5 text-center">Estado</th>
                <th className="p-5 text-center">Acciones de Seguridad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {cargando ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#e6b010]" /> Cargando administradores...
                  </td>
                </tr>
              ) : administradoresFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">No se encontraron administradores.</td>
                </tr>
              ) : (
                administradoresFiltrados.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-4">
                        <div className="relative w-10 h-10 rounded-full bg-yellow-50 border border-yellow-200 flex items-center justify-center font-bold text-[#e6b010] shrink-0">
                          {u.nombres?.charAt(0) ?? '?'}{u.apellidos?.charAt(0) ?? ''}
                          <span className="absolute -bottom-1 -right-1 bg-[#e6b010] rounded-full p-[2px] border-2 border-white">
                            <ShieldCheck className="w-2.5 h-2.5 text-white" />
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-[#e6b010] transition-colors">
                            {u.nombres} {u.apellidos}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">@{u.nombreUsuario}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-gray-900 font-medium">{u.dni || '---'}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-gray-900">{u.email}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{u.telefono || 'Sin teléfono'}</p>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                        Activa
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setUsuarioEditando(u); setModoVista(true); setIsModalOpen(true); }} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all" title="Ver Detalles">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setUsuarioEditando(u); setModoVista(false); setIsModalOpen(true); }} className="p-2 text-gray-500 hover:text-[#e6b010] hover:bg-yellow-50 rounded-lg transition-all" title="Editar Admin">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        
                        {/* BOTÓN QUE ABRE NUESTRO NUEVO MODAL */}
                        <button 
                          onClick={() => setModalConfirmacion({ isOpen: true, id: u.id, nombre: `${u.nombres} ${u.apellidos}`, procesando: false })} 
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100" 
                          title="Revocar Privilegios"
                        >
                          <ShieldX className="w-4 h-4" />
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

      <UsuarioModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setUsuarioEditando(null); }} 
        onSuccess={cargarDatos} 
        usuarioAEditar={usuarioEditando}
        isViewOnly={modoVista}
      />

      {/* NUEVO MODAL DE CONFIRMACIÓN PERSONALIZADO */}
      {modalConfirmacion.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-red-50">
              <div className="flex items-center gap-3 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h2 className="text-lg font-bold">Revocar Privilegios</h2>
              </div>
              <button 
                onClick={() => setModalConfirmacion({ isOpen: false, id: null, nombre: '', procesando: false })} 
                disabled={modalConfirmacion.procesando}
                className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-all disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 text-sm leading-relaxed">
                ¿Estás seguro de que deseas revocar los privilegios de administrador a <span className="font-bold text-gray-900">{modalConfirmacion.nombre}</span>?
              </p>
              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-xs text-gray-500 font-medium">
                  Su cuenta pasará a ser de un usuario estándar (USER) y perderá el acceso irrestricto al panel administrativo.
                </p>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button 
                type="button" 
                disabled={modalConfirmacion.procesando}
                onClick={() => setModalConfirmacion({ isOpen: false, id: null, nombre: '', procesando: false })} 
                className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                onClick={ejecutarRevocacion} 
                disabled={modalConfirmacion.procesando}
                className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-md disabled:opacity-70 transition-all"
              >
                {modalConfirmacion.procesando ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldX className="w-4 h-4" />}
                {modalConfirmacion.procesando ? 'Procesando...' : 'Sí, Revocar'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}