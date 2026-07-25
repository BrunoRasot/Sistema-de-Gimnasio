import { useState, ReactElement, useEffect } from 'react';
import { X, User, Briefcase, Lock, Loader2, Save, ShieldCheck, UserCog, CheckCircle2, Ban, PauseCircle } from 'lucide-react';
import { crearUsuario, actualizarUsuario } from '../../services/usuarios.service';
import { Usuario } from '../../types/usuario';

interface UsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  usuarioAEditar?: Usuario | null;
  isViewOnly?: boolean;
}

const estadoInicial = {
  nombres: '', apellidos: '', dni: '', fechaNacimiento: '', sexo: '',
  direccion: '', telefono: '', email: '',
  cargo: 'Recepcionista', turno: 'Mañana', fechaIngreso: '', estadoLaboral: 'Activo',
  nombreUsuario: '', password: '', confirmPassword: '', rol: 'USER', estadoCuenta: 'Activa'
};

export const UsuarioModal = ({ isOpen, onClose, onSuccess, usuarioAEditar, isViewOnly }: UsuarioModalProps) => {
  const isEdit = !!usuarioAEditar; 
  const [tab, setTab] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState(estadoInicial);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (usuarioAEditar) {
        setFormData({
          nombres: usuarioAEditar.nombres ?? '',
          apellidos: usuarioAEditar.apellidos ?? '',
          dni: usuarioAEditar.dni ?? '',
          fechaNacimiento: usuarioAEditar.fechaNacimiento ? String(usuarioAEditar.fechaNacimiento).split('T')[0] : '',
          sexo: usuarioAEditar.sexo ?? '',
          direccion: usuarioAEditar.direccion ?? '',
          telefono: usuarioAEditar.telefono ?? '',
          email: usuarioAEditar.email ?? '',
          cargo: usuarioAEditar.cargo ?? 'Recepcionista',
          turno: usuarioAEditar.turno ?? 'Mañana',
          fechaIngreso: usuarioAEditar.fechaIngreso ? String(usuarioAEditar.fechaIngreso).split('T')[0] : '',
          estadoLaboral: usuarioAEditar.estadoLaboral ?? 'Activo',
          nombreUsuario: usuarioAEditar.nombreUsuario ?? '',
          rol: usuarioAEditar.rol ?? 'USER',
          estadoCuenta: usuarioAEditar.estadoCuenta ?? 'Activa',
          password: '',
          confirmPassword: '',
        });
      } else {
        setFormData(estadoInicial);
      }
      setTab(1);
      setError('');
    }
  }, [isOpen, usuarioAEditar]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (isViewOnly) return;
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const setField = (name: string, value: string) => {
    if (isViewOnly) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewOnly) return;
    
    if (!isEdit) {
      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden.');
        setTab(3); return;
      }
      if (formData.password.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres.');
        setTab(3); return;
      }
    }

    setCargando(true);
    setError('');

    try {
      const payload: any = { ...formData };
      delete payload.confirmPassword;
      
      if (isEdit && usuarioAEditar) {
        delete payload.password;
        delete payload.dni;
        await actualizarUsuario(usuarioAEditar.id, payload);
      } else {
        await crearUsuario(payload);
      }
      
      setFormData(estadoInicial);
      setTab(1);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al procesar la solicitud.');
    } finally {
      setCargando(false);
    }
  };

  const inputClass = `w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all placeholder-gray-400 shadow-sm ${isViewOnly ? 'opacity-70 cursor-not-allowed bg-gray-50' : ''}`;
  const labelClass = "block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1";
  
  const passwordLenOk = formData.password.length >= 8;
  const passwordsMatch = formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword;

  const estadoCuentaOpciones: { value: string; label: string; icon: ReactElement; activeClass: string }[] = [
    { value: 'Activa', label: 'Activa', icon: <CheckCircle2 className="w-3.5 h-3.5" />, activeClass: 'bg-green-50 text-green-700 border-green-200' },
    { value: 'Suspendida', label: 'Suspendida', icon: <PauseCircle className="w-3.5 h-3.5" />, activeClass: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    { value: 'Bloqueada', label: 'Bloqueada', icon: <Ban className="w-3.5 h-3.5" />, activeClass: 'bg-red-50 text-red-700 border-red-200' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-all">
      <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
        
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              {isViewOnly ? 'Detalles del Trabajador' : isEdit ? 'Editar Trabajador' : 'Nuevo Trabajador'}
            </h2>
            <p className="text-[11px] text-gray-500">
              {isViewOnly ? 'Visualizando la información del trabajador seleccionado.' : isEdit ? 'Modifica los datos del trabajador seleccionado.' : 'Ingresa los datos para registrar un nuevo integrante en el equipo.'}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 rounded-lg transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex px-5 pt-3 border-b border-gray-100 gap-2 bg-white">
          <button type="button" onClick={() => setTab(1)} className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-all rounded-t-lg border-b-2 ${tab === 1 ? 'border-[#e6b010] text-gray-900 bg-yellow-50/50' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>
            <User className="w-3.5 h-3.5" /> Personal
          </button>
          <button type="button" onClick={() => setTab(2)} className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-all rounded-t-lg border-b-2 ${tab === 2 ? 'border-[#e6b010] text-gray-900 bg-yellow-50/50' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>
            <Briefcase className="w-3.5 h-3.5" /> Laboral
          </button>
          <button type="button" onClick={() => setTab(3)} className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-all rounded-t-lg border-b-2 ${tab === 3 ? 'border-[#e6b010] text-gray-900 bg-yellow-50/50' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>
            <Lock className="w-3.5 h-3.5" /> Acceso
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 custom-scrollbar bg-white">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
              {error}
            </div>
          )}

          <form id="trabajadorForm" onSubmit={handleSubmit} className="space-y-4">
            
            <div className={`space-y-3 transition-opacity duration-300 ${tab === 1 ? 'block opacity-100' : 'hidden opacity-0'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className={labelClass}>Nombres *</label><input required disabled={isViewOnly} name="nombres" value={formData.nombres} onChange={handleChange} className={inputClass} placeholder="Ej. Juan Pérez" /></div>
                <div><label className={labelClass}>Apellidos *</label><input required disabled={isViewOnly} name="apellidos" value={formData.apellidos} onChange={handleChange} className={inputClass} placeholder="Ej. García" /></div>
                <div>
                  <label className={labelClass}>DNI *</label>
                  <input required name="dni" maxLength={15} value={formData.dni} onChange={handleChange} className={`${inputClass} ${isEdit || isViewOnly ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''}`} placeholder="Número de documento" disabled={isEdit || isViewOnly} />
                </div>
                <div><label className={labelClass}>Correo Electrónico *</label><input required disabled={isViewOnly} type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="correo@ejemplo.com" /></div>
                <div><label className={labelClass}>Teléfono</label><input disabled={isViewOnly} name="telefono" value={formData.telefono} onChange={handleChange} className={inputClass} placeholder="+51 999 999 999" /></div>
                <div><label className={labelClass}>Fecha de Nacimiento</label><input disabled={isViewOnly} type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} className={inputClass} /></div>
                <div>
                  <label className={labelClass}>Sexo</label>
                  <select disabled={isViewOnly} name="sexo" value={formData.sexo} onChange={handleChange} className={inputClass}>
                    <option value="">Selecciona...</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div><label className={labelClass}>Dirección</label><input disabled={isViewOnly} name="direccion" value={formData.direccion} onChange={handleChange} className={inputClass} placeholder="Av. Principal 123" /></div>
              </div>
            </div>

            <div className={`space-y-3 transition-opacity duration-300 ${tab === 2 ? 'block opacity-100' : 'hidden opacity-0'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Cargo *</label>
                  <select disabled={isViewOnly} name="cargo" value={formData.cargo} onChange={handleChange} className={inputClass}>
                    <option value="Administrador">Administrador</option>
                    <option value="Recepcionista">Recepcionista</option>
                    <option value="Entrenador">Entrenador</option>
                    <option value="Cajero">Cajero</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Almacén">Almacén</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Turno</label>
                  <select disabled={isViewOnly} name="turno" value={formData.turno} onChange={handleChange} className={inputClass}>
                    <option value="Mañana">Mañana</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Noche">Noche</option>
                  </select>
                </div>
                <div><label className={labelClass}>Fecha de Ingreso</label><input disabled={isViewOnly} type="date" name="fechaIngreso" value={formData.fechaIngreso} onChange={handleChange} className={inputClass} /></div>
                <div>
                  <label className={labelClass}>Estado Laboral</label>
                  <select disabled={isViewOnly} name="estadoLaboral" value={formData.estadoLaboral} onChange={handleChange} className={inputClass}>
                    <option value="Activo">Activo</option>
                    <option value="Vacaciones">Vacaciones</option>
                    <option value="Suspendido">Suspendido</option>
                    <option value="Retirado">Retirado</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={`space-y-3 transition-opacity duration-300 ${tab === 3 ? 'block opacity-100' : 'hidden opacity-0'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className={labelClass}>Usuario de Acceso *</label><input disabled={isViewOnly} required name="nombreUsuario" value={formData.nombreUsuario} onChange={handleChange} className={inputClass} placeholder="Ej. jgarcia" /></div>
                
                {!isEdit && (
                  <>
                    <div>
                      <label className={labelClass}>Contraseña *</label>
                      <input required type="password" name="password" value={formData.password} onChange={handleChange} className={inputClass} placeholder="••••••••" />
                      {formData.password.length > 0 && (
                        <p className={`text-[10px] mt-1 ml-1 ${passwordLenOk ? 'text-green-600' : 'text-gray-500'}`}>
                          {passwordLenOk ? '✓ Longitud válida' : `Mínimo 8 caracteres (${formData.password.length}/8)`}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>Confirmar Contraseña *</label>
                      <input required type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={inputClass} placeholder="••••••••" />
                      {formData.confirmPassword.length > 0 && (
                        <p className={`text-[10px] mt-1 ml-1 ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                          {passwordsMatch ? '✓ Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {isEdit && !isViewOnly && (
                  <div className="md:col-span-2 bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <p className="text-[11px] text-blue-900 leading-relaxed">
                      El <strong>DNI</strong> y la <strong>Contraseña</strong> no se pueden modificar desde este formulario. Para cambiar la contraseña, accede al módulo correspondiente.
                    </p>
                  </div>
                )}

                <div className="md:col-span-2 mt-1">
                  <label className={labelClass}>Nivel de Permisos</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={isViewOnly}
                      onClick={() => setField('rol', 'USER')}
                      className={`flex items-start gap-2.5 p-3 rounded-lg border text-left transition-all ${isViewOnly ? 'cursor-not-allowed' : ''} ${formData.rol === 'USER' ? 'bg-gray-50 border-gray-400 ring-1 ring-gray-400 shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                    >
                      <UserCog className={`w-4 h-4 mt-0.5 shrink-0 ${formData.rol === 'USER' ? 'text-gray-700' : 'text-gray-400'}`} />
                      <span>
                        <span className={`block text-xs font-semibold ${formData.rol === 'USER' ? 'text-gray-900' : 'text-gray-500'}`}>Usuario Estándar</span>
                        <span className="block text-[10px] text-gray-500 mt-0.5">Acceso limitado a funciones diarias.</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      disabled={isViewOnly}
                      onClick={() => setField('rol', 'ADMIN')}
                      className={`flex items-start gap-2.5 p-3 rounded-lg border text-left transition-all ${isViewOnly ? 'cursor-not-allowed' : ''} ${formData.rol === 'ADMIN' ? 'bg-yellow-50 border-[#e6b010]/50 ring-1 ring-[#e6b010]/50 shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                    >
                      <ShieldCheck className={`w-4 h-4 mt-0.5 shrink-0 ${formData.rol === 'ADMIN' ? 'text-[#e6b010]' : 'text-gray-400'}`} />
                      <span>
                        <span className={`block text-xs font-semibold ${formData.rol === 'ADMIN' ? 'text-[#d4a00e]' : 'text-gray-500'}`}>Administrador</span>
                        <span className="block text-[10px] text-gray-500 mt-0.5">Acceso total al sistema.</span>
                      </span>
                    </button>
                  </div>
                </div>
                
                <div className="md:col-span-2 mt-1">
                  <label className={labelClass}>Estado de la Cuenta</label>
                  <div className="grid grid-cols-3 gap-2">
                    {estadoCuentaOpciones.map((opcion) => (
                      <button
                        key={opcion.value}
                        type="button"
                        disabled={isViewOnly}
                        onClick={() => setField('estadoCuenta', opcion.value)}
                        className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border text-[11px] font-semibold transition-all ${isViewOnly ? 'cursor-not-allowed' : ''} ${formData.estadoCuenta === opcion.value ? opcion.activeClass : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 bg-white'}`}
                      >
                        {opcion.icon} {opcion.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </form>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50">
          <button type="button" onClick={onClose} className="px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
            {isViewOnly ? 'Cerrar' : 'Cancelar'}
          </button>
          {!isViewOnly && (
            <button type="submit" form="trabajadorForm" disabled={cargando} className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-900 hover:bg-gray-800 text-white font-medium text-xs rounded-lg shadow-sm disabled:opacity-70 transition-all">
              {cargando && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <Save className="w-3.5 h-3.5" />
              {cargando ? 'Procesando...' : isEdit ? 'Guardar Cambios' : 'Registrar Trabajador'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};