import { useEffect, useMemo, useState, ReactElement } from 'react';
import {
  Plus, Search, RefreshCw, Loader2, Users, ShieldCheck, UserCog,
  UserCheck, UserX, Sun, Sunset, Moon, CalendarClock, Edit2, Trash2, Eye, FileSpreadsheet
} from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { obtenerUsuarios, eliminarUsuario } from '../../services/usuarios.service';
import { usePermisos } from '../../hooks/usePermisos';
import { UsuarioModal } from './UsuarioModal';
import { Usuario } from '../../types/usuario';

const turnoIcono: Record<string, ReactElement> = {
  'Mañana': <Sun className="w-3.5 h-3.5" />,
  'Tarde': <Sunset className="w-3.5 h-3.5" />,
  'Noche': <Moon className="w-3.5 h-3.5" />,
};

const estadoLaboralEstilos: Record<string, string> = {
  'Activo': 'bg-green-50 text-green-700 border-green-200',
  'Vacaciones': 'bg-blue-50 text-blue-700 border-blue-200',
  'Suspendido': 'bg-orange-50 text-orange-700 border-orange-200',
  'Retirado': 'bg-gray-100 text-gray-700 border-gray-200',
};

const estadoCuentaEstilos: Record<string, { badge: string; dot: string }> = {
  'Activa': { badge: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500' },
  'Bloqueada': { badge: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
  'Suspendida': { badge: 'bg-yellow-50 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500' },
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
  const { permisos } = usePermisos('usuarios');
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

  const handleEliminar = (usuario: Usuario) => {
    const nombreMostrar = usuario.nombres || usuario.apellidos 
      ? `${usuario.nombres ?? ''} ${usuario.apellidos ?? ''}`.trim() 
      : usuario.nombreUsuario;

    Swal.fire({
      padding: 0,
      showCloseButton: false,
      buttonsStyling: false,
      background: '#ffffff',
      width: 480,
      customClass: {
        popup: 'rounded-xl overflow-hidden shadow-xl border border-gray-200 p-0',
        actions: 'w-full m-0 p-4 bg-white flex justify-end gap-2',
        confirmButton: 'px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-all shadow-sm',
        cancelButton: 'px-4 py-1.5 text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-medium transition-all'
      },
      html: `
        <div class="flex flex-col text-left">
          <div class="bg-red-50 px-5 py-3.5 flex items-center justify-between border-b border-red-100">
            <div class="flex items-center gap-2 text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <path d="M12 9v4"/><path d="M12 17h.01"/>
              </svg>
              <h2 class="text-xs font-bold uppercase tracking-wider m-0 p-0">Eliminar Trabajador</h2>
            </div>
            <button type="button" onclick="Swal.close()" class="text-gray-400 hover:text-gray-700 transition-colors focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          
          <div class="bg-white p-5 space-y-3">
            <p class="text-gray-600 text-xs leading-relaxed m-0">
              ¿Estás seguro de que deseas eliminar permanentemente a <strong class="text-gray-900 font-bold">${nombreMostrar}</strong>?
            </p>
            
            <div class="p-3 bg-gray-50 border border-gray-200 rounded-lg text-[11px] text-gray-500 leading-relaxed">
              Su cuenta será eliminada del sistema (USER) y perderá el acceso de forma inmediata.
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonText: 'Sí, Eliminar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await eliminarUsuario(usuario.id);
          await cargarUsuarios();

          Swal.fire({
            title: '¡Eliminado!',
            text: 'El trabajador ha sido eliminado correctamente.',
            icon: 'success',
            background: '#ffffff',
            color: '#1f2937',
            buttonsStyling: false,
            customClass: {
              popup: 'rounded-xl border border-gray-200 shadow-xl',
              confirmButton: 'px-4 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium text-xs transition-all',
            }
          });

        } catch (error) {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo eliminar el trabajador.',
            icon: 'error',
            background: '#ffffff',
            color: '#1f2937',
            buttonsStyling: false,
            customClass: {
              popup: 'rounded-xl border border-gray-200 shadow-xl',
              confirmButton: 'px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-xs transition-all',
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

  const handleExportarExcel = async () => {
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

    try {
      const { default: ExcelJS } = await import('exceljs');
      const libro = new ExcelJS.Workbook();
      const hoja = libro.addWorksheet('Usuarios');
      const columnas = Object.keys(datosExcel[0] ?? {
        Nombres: '', Apellidos: '', DNI: '', Usuario: '', Email: '', Teléfono: '',
        Cargo: '', Turno: '', 'Situación Laboral': '', Rol: '', 'Estado de Cuenta': '',
        'Fecha de Ingreso': '',
      });
      hoja.columns = columnas.map((header) => ({ header, key: header, width: 22 }));
      hoja.addRows(datosExcel);
      hoja.getRow(1).font = { bold: true };

      const contenido = await libro.xlsx.writeBuffer();
      const blob = new Blob([contenido as BlobPart], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = 'Reporte_Trabajadores.xlsx';
      enlace.click();
      URL.revokeObjectURL(url);
      toast.success('Reporte exportado a Excel');
    } catch {
      toast.error('No se pudo exportar el reporte');
    }
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
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${esAdmin ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
        {esAdmin ? <ShieldCheck className="w-3 h-3" /> : <UserCog className="w-3 h-3" />}
        {esAdmin ? 'Administrador' : 'Estándar'}
      </span>
    );
  };

  const getEstadoCuentaBadge = (estado: string) => {
    const estilo = estadoCuentaEstilos[estado] ?? estadoCuentaEstilos['Suspendida'];
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${estilo.badge}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${estilo.dot}`}></span>
        {estado}
      </span>
    );
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-4 text-gray-900">
      <div className="module-header bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 bg-yellow-50 rounded-lg border border-yellow-100 text-[#e6b010]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 tracking-wide">Gestión de Usuarios</h1>
            <p className="text-[11px] text-gray-500 mt-0.5">Consulta y administra las cuentas registradas.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button onClick={cargarUsuarios} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-all border border-gray-200" title="Actualizar">
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExportarExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-medium transition-all border border-green-200 shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
          </button>
          {permisos.crear && <button
            onClick={() => { setUsuarioEditando(null); setModoVista(false); setIsModalOpen(true); }}
            className="px-4 py-2 bg-[#141414] hover:bg-black text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Nuevo Usuario
          </button>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-3.5 flex items-center gap-3 shadow-sm">
          <div className="p-2 rounded-lg bg-yellow-50 border border-yellow-100"><Users className="w-4 h-4 text-[#e6b010]" /></div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-none">{usuarios.length}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Total registrados</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3.5 flex items-center gap-3 shadow-sm">
          <div className="p-2 rounded-lg bg-green-50 border border-green-100"><UserCheck className="w-4 h-4 text-green-600" /></div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-none">{metricas.activos}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Con acceso activo</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3.5 flex items-center gap-3 shadow-sm">
          <div className="p-2 rounded-lg bg-red-50 border border-red-100"><UserX className="w-4 h-4 text-red-600" /></div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-none">{metricas.bloqueados}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Bloqueados / suspendidos</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3.5 flex items-center gap-3 shadow-sm">
          <div className="p-2 rounded-lg bg-blue-50 border border-blue-100"><ShieldCheck className="w-4 h-4 text-blue-600" /></div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-none">{metricas.admins}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Administradores</p>
          </div>
        </div>
      </div>

      <div className="relative flex items-center">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, DNI, usuario o email..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-xs text-gray-900 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all placeholder-gray-400 shadow-sm"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse min-w-[1300px]">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <th className="py-3 px-4 pl-5">Usuario</th>
                <th className="py-3 px-4">Identificación</th>
                <th className="py-3 px-4">Cargo / Turno</th>
                <th className="py-3 px-4">Situación Laboral</th>
                <th className="py-3 px-4">Rol</th>
                <th className="py-3 px-4">Contacto</th>
                <th className="py-3 px-4">Antigüedad</th>
                <th className="py-3 px-4 text-center">Estado de Cuenta</th>
                <th className="py-3 px-4 text-center pr-5">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {cargando ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#e6b010]" /> Cargando datos...
                  </td>
                </tr>
              ) : usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-gray-500">
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
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-3 px-4 pl-5">
                        <div className="flex items-center gap-3">
                          <div className={`relative w-8 h-8 rounded-full bg-gray-100 border flex items-center justify-center font-bold text-[10px] shrink-0 shadow-sm ${esAdmin ? 'border-yellow-300 text-[#e6b010]' : 'border-gray-200 text-gray-600'}`}>
                            {iniciales}
                            {esAdmin && (
                              <span className="absolute -bottom-0.5 -right-0.5 bg-[#e6b010] rounded-full p-[1px] border border-white">
                                <ShieldCheck className="w-2 h-2 text-white" />
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 group-hover:text-[#e6b010] transition-colors">
                              {nombres || apellidos ? `${nombres ?? ''} ${apellidos ?? ''}`.trim() : u.nombreUsuario}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-0.5">@{u.nombreUsuario}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-gray-900 font-medium">{dni || '---'}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Nac. {formatFecha(fechaNacimiento)}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded-md bg-gray-100 border border-gray-200 text-gray-700 text-[10px] font-medium">
                          {cargo || '---'}
                        </span>
                        {turno && (
                          <p className="flex items-center gap-1 text-[10px] text-gray-500 mt-1">
                            {turnoIcono[turno] ?? <Sun className="w-3 h-3" />} Turno {turno}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${estadoLaboralEstilos[estadoLaboral ?? ''] ?? estadoLaboralEstilos['Retirado']}`}>
                          {estadoLaboral ?? '---'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {getRolBadge(u.rol)}
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-gray-900">{u.email}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{telefono || 'Sin teléfono'}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-gray-900">
                          <CalendarClock className="w-3 h-3 text-gray-400" />
                          {antiguedad ?? '---'}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">Desde {formatFecha(fechaIngreso)}</p>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getEstadoCuentaBadge(u.estadoCuenta)}
                      </td>
                      <td className="py-3 px-4 text-center pr-5">
                        <div className="flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setUsuarioEditando(u); setModoVista(true); setIsModalOpen(true); }} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all" title="Ver Detalles">
                            <Eye className="w-4 h-4" />
                          </button>
                          {permisos.editar && <button onClick={() => { setUsuarioEditando(u); setModoVista(false); setIsModalOpen(true); }} className="p-1.5 text-gray-500 hover:text-[#e6b010] hover:bg-yellow-50 rounded-md transition-all" title="Editar">
                            <Edit2 className="w-4 h-4" />
                          </button>}
                          {permisos.eliminar && <button onClick={() => handleEliminar(u)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-all" title="Eliminar">
                            <Trash2 className="w-4 h-4" />
                          </button>}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <p className="text-[11px] font-medium text-gray-500">
            Mostrando <span className="text-gray-900 font-bold">{usuariosFiltrados.length}</span> de <span className="text-gray-900 font-bold">{usuarios.length}</span> registros
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
