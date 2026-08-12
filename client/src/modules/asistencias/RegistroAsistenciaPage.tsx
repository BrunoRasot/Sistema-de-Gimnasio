import { useState } from 'react';
import { Search, UserCheck, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import { buscarPorDni, registrarAsistencia } from '../../services/asistencias.service';
import toast from 'react-hot-toast';

export default function RegistroAsistenciaPage() {
  const [dni, setDni] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [miembro, setMiembro] = useState<any>(null);
  const [registrando, setRegistrando] = useState(false);

  const handleBuscar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!dni || dni.length < 8) return toast.error('Ingrese un DNI válido');

    setBuscando(true);
    setMiembro(null);
    try {
      const data = await buscarPorDni(dni);
      setMiembro(data);
    } catch (error) {
      toast.error('No se encontró ningún miembro con este DNI');
    } finally {
      setBuscando(false);
    }
  };

  const handleRegistrar = async () => {
    if (!miembro) return;
    setRegistrando(true);
    try {
      // Enviamos un objeto con la propiedad miembroId que el backend espera
      await registrarAsistencia({ miembroId: miembro.id });
      toast.success('Asistencia registrada correctamente');
      setDni('');
      setMiembro(null);
    } catch (error: any) {
      toast.error(
        error.response?.data?.mensaje || error.message || 'Error al registrar asistencia',
      );
    } finally {
      setRegistrando(false);
    }
  };

  const membresiaActiva = miembro?.membresias?.[0];
  const tieneAcceso = !!membresiaActiva;

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-yellow-50 border border-yellow-100 rounded-lg text-yellow-600">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">Registro de Asistencia</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Busque un cliente, valide su membresía y registre su acceso.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleBuscar}
        className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-sm"
      >
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Buscar por código, cliente, concepto o método..."
          value={dni}
          onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
          maxLength={15}
          autoFocus
          className="flex-1 outline-none text-sm text-gray-900 placeholder-gray-400 bg-transparent py-1.5"
        />
        <button
          type="submit"
          disabled={buscando || !dni}
          className="px-5 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {buscando ? 'Buscando...' : 'Verificar'}
        </button>
      </form>

      {miembro && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div
            className={`p-6 border-b ${tieneAcceso ? 'bg-green-50/30 border-green-50' : 'bg-red-50/30 border-red-50'}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {miembro.nombres} {miembro.apellidos}
                </h2>
                <p className="text-sm text-gray-500 mt-1">DNI: {miembro.dni}</p>
              </div>
              <div className="flex flex-col items-end">
                {tieneAcceso ? (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-green-600 font-bold text-xs uppercase tracking-wider rounded-lg border border-green-200 shadow-sm">
                    <CheckCircle2 className="w-4 h-4" /> Acceso Permitido
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-red-600 font-bold text-xs uppercase tracking-wider rounded-lg border border-red-200 shadow-sm">
                    <XCircle className="w-4 h-4" /> Acceso Denegado
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Detalles de la Membresía
              </h3>
              {tieneAcceso ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Plan Contratado</p>
                    <p className="text-sm font-bold text-gray-900">
                      {membresiaActiva.plan?.nombre || 'Plan Estándar'}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Fecha de Vencimiento</p>
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(membresiaActiva.fechaFin).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-white text-red-600 rounded-xl border border-red-100 flex items-center gap-3 text-sm font-medium shadow-sm">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  El cliente no cuenta con una membresía activa o se encuentra vencida.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setMiembro(null);
                  setDni('');
                }}
                className="px-5 py-2 text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 font-medium text-xs rounded-lg transition-colors"
              >
                Limpiar
              </button>
              <button
                onClick={handleRegistrar}
                disabled={!tieneAcceso || registrando}
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-medium text-xs rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {registrando ? 'Procesando...' : 'Confirmar Ingreso'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
