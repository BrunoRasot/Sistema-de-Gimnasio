import { useState } from 'react';
import { configuracionService } from '../../services/configuracion.service';
import { ShieldCheck, Save, KeyRound, Lock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SeguridadPage() {
  const [guardando, setGuardando] = useState(false);
  const [passwords, setPasswords] = useState({
    actual: '',
    nueva: '',
    confirmacion: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!passwords.actual || !passwords.nueva || !passwords.confirmacion) {
      return toast.error('Debe completar todos los campos');
    }
    if (passwords.nueva !== passwords.confirmacion) {
      return toast.error('La nueva contraseña y la confirmación no coinciden');
    }
    if (passwords.nueva.length < 8) {
      return toast.error('La nueva contraseña debe tener al menos 8 caracteres');
    }

    setGuardando(true);
    try {
      await configuracionService.cambiarPassword({
        actual: passwords.actual,
        nueva: passwords.nueva,
      });
      toast.success('Contraseña actualizada correctamente');
      setPasswords({ actual: '', nueva: '', confirmacion: '' });
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar la contraseña');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-[850px] mx-auto space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Seguridad de la Cuenta</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Gestione sus credenciales de acceso y la protección de su perfil.
          </p>
        </div>
        <div className="p-2.5 bg-red-50 border border-red-100 rounded-xl text-red-600 shadow-sm">
          <ShieldCheck className="w-5 h-5" />
        </div>
      </div>
      <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/40 flex items-start gap-4">
          <div className="p-2 bg-white border border-gray-200 rounded-lg text-gray-700 shadow-sm mt-0.5">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Actualizar Contraseña</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Por seguridad, requerimos su contraseña actual para validar que es usted quien realiza
              el cambio.
            </p>
          </div>
        </div>
        <div className="p-6 md:p-8 space-y-6">
          <div className="space-y-2 max-w-[420px]">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-gray-400" /> Contraseña Actual
            </label>
            <input
              type="password"
              name="actual"
              placeholder="••••••••••••"
              value={passwords.actual}
              onChange={handleChange}
              className="w-full bg-white border border-gray-200 rounded-xl py-3 px-3.5 text-sm text-gray-900 placeholder:text-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
            />
          </div>

          <div className="h-px bg-gray-100 my-2" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Nueva Contraseña
              </label>
              <input
                type="password"
                name="nueva"
                placeholder="Mínimo 8 caracteres"
                value={passwords.nueva}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 rounded-xl py-3 px-3.5 text-sm text-gray-900 placeholder:text-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                name="confirmacion"
                placeholder="Repita la nueva contraseña"
                value={passwords.confirmacion}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 rounded-xl py-3 px-3.5 text-sm text-gray-900 placeholder:text-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-blue-500" />
            <span>
              Asegúrese de usar una combinación de letras, números y símbolos para mayor seguridad.
            </span>
          </div>
        </div>

        <div className="px-6 md:px-8 py-4 bg-gray-50/60 border-t border-gray-100 flex justify-end">
          <button
            onClick={handleSave}
            disabled={guardando}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {guardando ? 'Actualizando...' : 'Actualizar Contraseña'}
          </button>
        </div>
      </div>
    </div>
  );
}
