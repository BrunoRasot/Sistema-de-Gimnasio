import { useEffect, useMemo, useState, ReactElement } from 'react';
import {
  Plus, Search, RefreshCw, Loader2, Users, ShieldCheck, UserCog,
  UserCheck, UserX, Sun, Sunset, Moon, CalendarClock, Edit2, Trash2, Eye, FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { obtenerUsuarios, eliminarUsuario } from '../../services/usuarios.service';
import { UsuarioModal } from './UsuarioModal';
import { Usuario } from '../../types/usuario';

const turnoIcono: Record<string, ReactElement> = {
  'Mañana': <Sun className="w-3.5 h-3.5" />,
  'Tarde': <Sunset className="w-3.5 h-3.5" />,
  'Noche': <Moon className="w-3.5 h-3.5" />,
};

const estadoLaboralEstilos: Record<string, string> = {
  'Activo': 'bg-green-100 text-green-700 border-green-200',
  'Vacaciones': 'bg-blue-100 text-blue-700 border-blue-200',
  'Suspendido': 'bg-orange-100 text-orange-700 border-orange-200',
  'Retirado': 'bg-gray-100 text-gray-700 border-gray-200',
};

const estadoCuentaEstilos: Record<string, { badge: string; dot: string }> = {
  'Activa': { badge: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
  'Bloqueada': { badge: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' },
  'Suspendida': { badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500' },
};

const formatFecha = (fecha?: string | null) => {
  if (!fecha) return '--/--/----';
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return '--/--/----';
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
};

const calcularAntiguedad = (fechaIngreso?: string | null) => {
  if (!fechaIngreso) return null;
  const ingreso = new Date(fechaIngreso);
  if (isNaN(ingreso.getTime())) return null;
  const ahora = new Date();
  let meses = (ahora.getFullYear() - ingreso.getFullYear()) * 12 + (ahora.getMonth() - ingreso.getMonth());
  if (ahora.getDate() < ingreso.getDate()) meses--;
  if (meses < 0) meses = 0;
  if (meses < 12) return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
  const años = Math.floor(meses / 12);
  return `${años} ${años === 1 ? 'año' : 'años'}`;
};

export default function ListaUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [modoVista, setModoVista] = useState(false);
  const [buscar, setBuscar] = useState('');

  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const data = await obtenerUsuarios({});
      setUsuarios(data.usuarios);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar la lista de usuarios');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarUsuarios(); }, []);

  // DISEÑO PREMIUM CLARO (Alineación Perfecta)
  const handleEliminar = (usuario: Usuario) => {
    const nombreMostrar = usuario.nombres || usuario.apellidos 
      ? `${usuario.nombres ?? ''} ${usuario.apellidos ?? ''}`.trim() 
      : usuario.nombreUsuario;

    Swal.fire({
      padding: 0,
      showCloseButton: false, // Apagamos el de defecto para usar el nuestro perfectamente alineado
      buttonsStyling: false,
      background: '#ffffff',
      width: 480,
      customClass: {
        popup: 'rounded-2xl overflow-hidden shadow-2xl border border-gray-200 p-0',
        actions: 'w-full m-0 p-5 bg-white flex justify-end gap-3',
        confirmButton: 'px-5 py-2.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-xl font-bold transition-all shadow-sm',
        cancelButton: 'px-5 py-2.5 text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl font-bold transition-all'
      },
      html: `
        <div class="flex flex-col text-left">
          <!-- Header Rojo Claro (A ras de los bordes) -->
          <div class="bg-[#fef2f2] px-6 py-4 flex items-center justify-between border-b border-red-100">
            <div class="flex items-center gap-2.5 text-[#dc2626]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <path d="M12 9v4"/><path d="M12 17h.01"/>
              </svg>
              <h2 class="text-[17px] font-bold m-0 p-0 tracking-tight">Eliminar Trabajador</h2>
            </div>
            <!-- Botón Cerrar (X) alineado manualmente -->
            <button type="button" onclick="Swal.close()" class="text-gray-400 hover:text-gray-700 transition-colors focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          
          <!-- Cuerpo Blanco -->
          <div class="bg-white px-6 pt-6 pb-2">
            <p class="text-gray-600 text-[15px] m-0 leading-relaxed">
              ¿Estás seguro de que deseas eliminar permanentemente a <strong class="text-gray-900 font-bold">${nombreMostrar}</strong>?
            </p>
            
            <!-- Caja Gris de Advertencia -->
            <div class="mt-5 p-4 bg-gray-50 border border-gray-200 rounded-xl text-[13.5px] text-gray-500 leading-relaxed shadow-sm">
              Su cuenta será eliminada del sistema (USER) y perderá el acceso de forma inmediata.
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      reverseButtons: true, // ESTO PONE EL BOTÓN CANCELAR A LA IZQUIERDA
      confirmButtonText: `
        <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>
          </svg>
          <span>Sí, Eliminar</span>
        </div>
      `,
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await eliminarUsuario(usuario.id);
          await cargarUsuarios();

          // Alerta de Éxito
          Swal.fire({
            title: '¡Eliminado!',
            text: 'El trabajador ha sido eliminado correctamente.',
            icon: 'success',
            background: '#ffffff',
            color: '#1f2937',
            buttonsStyling: false,
            customClass: {
              popup: 'rounded-2xl border border-gray-100 shadow-xl',
              confirmButton: 'px-6 py-2.5 bg-[#e6b010] hover:bg-[#d4a00e] text-white rounded-xl font-bold transition-all',
            }
          });

        } catch (error) {
          // Alerta de Error
          Swal.fire({
            title: 'Error',
            text: 'No se pudo eliminar el trabajador.',
            icon: 'error',
            background: '#ffffff',
            color: '#1f2937',
            buttonsStyling: false,
            customClass: {
              popup: 'rounded-2xl border border-gray-100 shadow-xl',
              confirmButton: 'px-6 py-2.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-xl font-bold transition-all',
            }
          });
        }
      }
    });
  };

  const usuariosFiltrados = useMemo(() => {
    const term = buscar.trim().toLowerCase();
    if (!term) return usuarios;
    return usuarios.filter((u) =>
      u.nombreUsuario?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.dni?.toLowerCase().includes(term) ||
      `${u.nombres ?? ''} ${u.apellidos ?? ''}`.toLowerCase().includes(term)
    );
  }, [usuarios, buscar]);

  const handleExportarExcel = () => {
    const datosExcel = usuariosFiltrados.map(u => ({
      'Nombres': u.nombres || '',
      'Apellidos': u.apellidos || '',
      'DNI': u.dni,
      'Usuario': u.nombreUsuario,
      'Email': u.email,
      'Teléfono': u.telefono || 'Sin teléfono',
      'Cargo': u.cargo || '',
      'Turno': u.turno || '',
      'Situación Laboral': u.estadoLaboral,
      'Rol': u.rol === 'ADMIN' ? 'Administrador' : 'Estándar',
      'Estado de Cuenta': u.estadoCuenta,
      'Fecha de Ingreso': formatFecha(u.fechaIngreso)
    }));

    const hoja = XLSX.utils.json_to_sheet(datosExcel);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Usuarios");
    XLSX.writeFile(libro, "Reporte_Trabajadores.xlsx");
    toast.success('Reporte exportado a Excel');
  };

  const metricas = useMemo(() => {
    const activos = usuarios.filter(u => u.estadoCuenta === 'Activa').length;
    const bloqueados = usuarios.filter(u => u.estadoCuenta === 'Bloqueada' || u.estadoCuenta === 'Suspendida').length;
    const admins = usuarios.filter(u => u.rol === 'ADMIN').length;
    return { activos, bloqueados, admins };
  }, [usuarios]);

  const getRolBadge = (rol?: string) => {
    const esAdmin = rol === 'ADMIN';
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${esAdmin ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
        {esAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <UserCog className="w-3.5 h-3.5" />}
        {esAdmin ? 'Administrador' : 'Estándar'}
      </span>
    );
  };

  const getEstadoCuentaBadge = (estado: string) => {
    const estilo = estadoCuentaEstilos[estado] ?? estadoCuentaEstilos['Suspendida'];
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${estilo.badge}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${estilo.dot}`}></span>
        {estado}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto text-gray-900">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-100">
            <Users className="w-6 h-6 text-[#e6b010]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-wide">Gestión de Usuarios</h1>
            <p className="text-sm text-gray-500 mt-1">Consulta y administra las cuentas registradas.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={cargarUsuarios} className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-900 transition-all border border-gray-200">
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExportarExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl text-sm font-medium transition-all border border-green-200"
          >
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </button>
          <button
            onClick={() => { setUsuarioEditando(null); setModoVista(false); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#e6b010] hover:bg-[#d4a00e] text-white font-bold rounded-xl text-sm transition-all shadow-md"
          >
            <Plus className="w-4 h-4" /> Nuevo Usuario
          </button>
        </div>
      </div>

      {/* METRICAS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-yellow-50 border border-yellow-100"><Users className="w-4 h-4 text-[#e6b010]" /></div>
          <div>
            <p className="text-lg font-bold text-gray-900 leading-none">{usuarios.length}</p>
            <p className="text-[11px] text-gray-500 mt-1">Total registrados</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-green-50 border border-green-100"><UserCheck className="w-4 h-4 text-green-600" /></div>
          <div>
            <p className="text-lg font-bold text-gray-900 leading-none">{metricas.activos}</p>
            <p className="text-[11px] text-gray-500 mt-1">Con acceso activo</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-100"><UserX className="w-4 h-4 text-red-600" /></div>
          <div>
            <p className="text-lg font-bold text-gray-900 leading-none">{metricas.bloqueados}</p>
            <p className="text-[11px] text-gray-500 mt-1">Bloqueados / suspendidos</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100"><ShieldCheck className="w-4 h-4 text-blue-600" /></div>
          <div>
            <p className="text-lg font-bold text-gray-900 leading-none">{metricas.admins}</p>
            <p className="text-[11px] text-gray-500 mt-1">Administradores</p>
          </div>
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, DNI, usuario o email..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-11 pr-4 text-sm text-gray-900 focus:border-[#e6b010] focus:ring-1 focus:ring-[#e6b010] outline-none transition-all placeholder-gray-400 shadow-sm"
        />
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1300px]">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200">
                <th className="p-5 pl-6">Usuario</th>
                <th className="p-5">Identificación</th>
                <th className="p-5">Cargo / Turno</th>
                <th className="p-5">Situación Laboral</th>
                <th className="p-5">Rol</th>
                <th className="p-5">Contacto</th>
                <th className="p-5">Antigüedad</th>
                <th className="p-5 text-center">Estado de Cuenta</th>
                <th className="p-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {cargando ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#e6b010]" /> Cargando datos...
                  </td>
                </tr>
              ) : usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-gray-500">
                    No se encontraron usuarios que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((u) => {
                  const nombres = u.nombres;
                  const apellidos = u.apellidos;
                  const dni = u.dni;
                  const fechaNacimiento = u.fechaNacimiento;
                  const cargo = u.cargo;
                  const turno = u.turno;
                  const estadoLaboral = u.estadoLaboral;
                  const telefono = u.telefono;
                  const fechaIngreso = u.fechaIngreso;
                  const esAdmin = u.rol === 'ADMIN';
                  const antiguedad = calcularAntiguedad(fechaIngreso);
                  const iniciales = `${nombres?.charAt(0) ?? u.nombreUsuario?.charAt(0) ?? '?'}${apellidos?.charAt(0) ?? ''}`;

                  return (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-4">
                          <div className={`relative w-11 h-11 rounded-full bg-gray-100 border flex items-center justify-center font-bold shrink-0 shadow-sm ${esAdmin ? 'border-yellow-300 text-[#e6b010]' : 'border-gray-200 text-gray-600'}`}>
                            {iniciales}
                            {esAdmin && (
                              <span className="absolute -bottom-1 -right-1 bg-[#e6b010] rounded-full p-[3px] border-2 border-white">
                                <ShieldCheck className="w-2.5 h-2.5 text-white" />
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 group-hover:text-[#e6b010] transition-colors">
                              {nombres || apellidos ? `${nombres ?? ''} ${apellidos ?? ''}`.trim() : u.nombreUsuario}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">@{u.nombreUsuario}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-gray-900 font-medium tracking-wide">{dni || '---'}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Nac. {formatFecha(fechaNacimiento)}</p>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex px-3 py-1 rounded-lg bg-gray-100 border border-gray-200 text-gray-700 text-xs font-medium">
                          {cargo || '---'}
                        </span>
                        {turno && (
                          <p className="flex items-center gap-1.5 text-xs text-gray-500 mt-1.5 ml-0.5">
                            {turnoIcono[turno] ?? <Sun className="w-3.5 h-3.5" />} Turno {turno}
                          </p>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${estadoLaboralEstilos[estadoLaboral ?? ''] ?? estadoLaboralEstilos['Retirado']}`}>
                          {estadoLaboral ?? '---'}
                        </span>
                      </td>
                      <td className="p-4">
                        {getRolBadge(u.rol)}
                      </td>
                      <td className="p-4">
                        <p className="text-gray-900">{u.email}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{telefono || 'Sin teléfono'}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-gray-900">
                          <CalendarClock className="w-3.5 h-3.5 text-gray-400" />
                          {antiguedad ?? '---'}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">Desde {formatFecha(fechaIngreso)}</p>
                      </td>
                      <td className="p-4 text-center">
                        {getEstadoCuentaBadge(u.estadoCuenta)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setUsuarioEditando(u); setModoVista(true); setIsModalOpen(true); }} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setUsuarioEditando(u); setModoVista(false); setIsModalOpen(true); }} className="p-2 text-gray-500 hover:text-[#e6b010] hover:bg-yellow-50 rounded-lg transition-all">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleEliminar(u)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-5 border-t border-gray-200 flex items-center justify-between bg-gray-50 rounded-b-2xl">
          <p className="text-xs font-medium text-gray-500">
            Mostrando <span className="text-gray-900">{usuariosFiltrados.length}</span> de <span className="text-gray-900">{usuarios.length}</span> registros
          </p>
        </div>
      </div>
      <UsuarioModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setUsuarioEditando(null); }}
        onSuccess={cargarUsuarios}
        usuarioAEditar={usuarioEditando}
        isViewOnly={modoVista}
      />
    </div>
  );
}