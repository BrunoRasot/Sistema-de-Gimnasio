import { useState, useEffect, useMemo } from 'react';
import { Search, RefreshCw, CreditCard, Loader2, Ban, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { pagosService } from '../../services/pagos.service';

export default function RegistroPagosPage() {
  const [pagos, setPagos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [buscar, setBuscar] = useState('');

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const data = await pagosService.obtenerPagos();
      setPagos(data);
    } catch (err) {
      toast.error('Error al cargar el registro de pagos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleAnularPago = (pago: any) => {
    Swal.fire({
      title: '¿Anular Pago?',
      text: `¿Estás seguro de anular el pago ${pago.codigo}? Esta acción es irreversible.`,
      icon: 'warning',
      background: '#ffffff',
      color: '#1f2937',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#e5e7eb',
      confirmButtonText: 'Sí, anular',
      cancelButtonText: '<span style="color: black">Cancelar</span>',
      customClass: { popup: 'border border-gray-200 rounded-xl shadow-xl' }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await pagosService.anularPago(pago.id);
          toast.success('Pago anulado correctamente');
          cargarDatos();
        } catch (err: any) {
          Swal.fire({ title: 'Error', text: err.message || 'No se pudo anular el pago', icon: 'error', background: '#ffffff', color: '#1f2937' });
        }
      }
    });
  };

  const pagosFiltrados = useMemo(() => {
    const term = buscar.toLowerCase().trim();
    if (!term) return pagos;
    return pagos.filter(p => 
      p.codigo?.toLowerCase().includes(term) || 
      p.cliente?.toLowerCase().includes(term) ||
      p.concepto?.toLowerCase().includes(term) ||
      p.metodo?.nombre?.toLowerCase().includes(term)
    );
  }, [pagos, buscar]);

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-4 text-gray-900">
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 bg-yellow-50 rounded-lg border border-yellow-100 text-[#e6b010]">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 tracking-wide">Registro de Pagos</h1>
            <p className="text-[11px] text-gray-500 mt-0.5">Control y seguimiento de todas las transacciones monetarias.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button onClick={cargarDatos} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-500 transition-all border border-gray-200" title="Actualizar">
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="relative flex items-center">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por código, cliente, concepto o método..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-xs text-gray-900 focus:border-gray-900 outline-none transition-all shadow-sm"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <th className="py-3 px-4 pl-5">Código</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Concepto</th>
                <th className="py-3 px-4">Método</th>
                <th className="py-3 px-4 text-right">Monto</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4 text-center pr-5">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {cargando ? (
                <tr><td colSpan={8} className="py-10 text-center text-gray-500"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#e6b010]" /> Cargando pagos...</td></tr>
              ) : pagosFiltrados.length === 0 ? (
                <tr><td colSpan={8} className="py-10 text-center text-gray-500">No se encontraron pagos registrados.</td></tr>
              ) : (
                pagosFiltrados.map((p) => (
                  <tr key={p.id} className={`hover:bg-gray-50/50 transition-colors ${p.estado === 'Anulado' ? 'opacity-70' : ''}`}>
                    <td className="py-3 px-4 pl-5 font-bold text-gray-900">{p.codigo}</td>
                    <td className="py-3 px-4 text-gray-700">{p.cliente || 'Público General'}</td>
                    <td className="py-3 px-4 text-gray-600 truncate max-w-[200px]">{p.concepto}</td>
                    <td className="py-3 px-4 text-gray-600">
                      <span className="bg-gray-100 px-2.5 py-0.5 rounded-md text-[10px] font-medium border border-gray-200">{p.metodo?.nombre || 'Indefinido'}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">S/ {Number(p.monto).toFixed(2)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        p.estado === 'Completado' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {p.estado === 'Completado' && <CheckCircle className="w-3 h-3" />}
                        {p.estado === 'Anulado' && <Ban className="w-3 h-3" />}
                        {p.estado}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{new Date(p.fecha).toLocaleString()}</td>
                    <td className="py-3 px-4 text-center pr-5">
                      {p.estado !== 'Anulado' && (
                        <button onClick={() => handleAnularPago(p)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-all" title="Anular Pago">
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}