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
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-4 text-gray-900">
      
      <div className="module-header bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 bg-yellow-50 rounded-lg border border-yellow-100 text-[#e6b010]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 tracking-wide">Administradores</h1>
            <p className="text-[11px] text-gray-500 mt-0.5">Supervisa las cuentas con acceso total al sistema.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button onClick={cargarDatos} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-all border border-gray-200" title="Actualizar">
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="relative flex items-center">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar administrador por nombre, DNI, usuario o email..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-xs text-gray-900 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all placeholder-gray-400 shadow-sm"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <th className="py-3 px-4 pl-5">Administrador</th>
                <th className="py-3 px-4">Identificación</th>
                <th className="py-3 px-4">Contacto</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-center pr-5">Acciones de Seguridad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {cargando ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#e6b010]" /> Cargando administradores...
                  </td>
                </tr>
              ) : administradoresFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-500">No se encontraron administradores.</td>
                </tr>
              ) : (
                administradoresFiltrados.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-3 px-4 pl-5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-full bg-yellow-50 border border-yellow-200 flex items-center justify-center font-bold text-[#e6b010] text-[10px] shrink-0">
                          {u.nombres?.charAt(0) ?? '?'}{u.apellidos?.charAt(0) ?? ''}
                          <span className="absolute -bottom-0.5 -right-0.5 bg-[#e6b010] rounded-full p-[1px] border border-white">
                            <ShieldCheck className="w-2 h-2 text-white" />
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-[#e6b010] transition-colors">
                            {u.nombres} {u.apellidos}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-0.5">@{u.nombreUsuario}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-900 font-medium">{u.dni || '---'}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-900">{u.email}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{u.telefono || 'Sin teléfono'}</p>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-200">
                        Activa
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center pr-5">
                      <div className="flex items-center justify-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setUsuarioEditando(u); setModoVista(true); setIsModalOpen(true); }} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all" title="Ver Detalles">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setUsuarioEditando(u); setModoVista(false); setIsModalOpen(true); }} className="p-1.5 text-gray-500 hover:text-[#e6b010] hover:bg-yellow-50 rounded-md transition-all" title="Editar Admin">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        
                        <button 
                          onClick={() => setModalConfirmacion({ isOpen: true, id: u.id, nombre: `${u.nombres} ${u.apellidos}`, procesando: false })} 
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all border border-transparent hover:border-red-100" 
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

      {modalConfirmacion.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white border border-gray-200 rounded-xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-red-50">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <h2 className="text-xs font-bold uppercase tracking-wider">Revocar Privilegios</h2>
              </div>
              <button 
                onClick={() => setModalConfirmacion({ isOpen: false, id: null, nombre: '', procesando: false })} 
                disabled={modalConfirmacion.procesando}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg transition-all disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-5 space-y-3">
              <p className="text-gray-600 text-xs leading-relaxed">
                ¿Estás seguro de que deseas revocar los privilegios de administrador a <span className="font-bold text-gray-900">{modalConfirmacion.nombre}</span>?
              </p>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-[11px] text-gray-500 font-medium">
                  Su cuenta pasará a ser de un usuario estándar (USER) y perderá el acceso irrestricto al panel administrativo.
                </p>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50">
              <button 
                type="button" 
                disabled={modalConfirmacion.procesando}
                onClick={() => setModalConfirmacion({ isOpen: false, id: null, nombre: '', procesando: false })} 
                className="px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                onClick={ejecutarRevocacion} 
                disabled={modalConfirmacion.procesando}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-lg shadow-sm disabled:opacity-70 transition-all"
              >
                {modalConfirmacion.procesando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldX className="w-3.5 h-3.5" />}
                {modalConfirmacion.procesando ? 'Procesando...' : 'Sí, Revocar'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
