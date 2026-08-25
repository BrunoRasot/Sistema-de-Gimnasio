import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';
import { Search, Printer, Loader2, FileText } from 'lucide-react';
import { ventasService } from '../../services/ventas.service';
import toast from 'react-hot-toast';

export default function ComprobantesVentasPage() {
  const [searchParams] = useSearchParams();
  const idParam = searchParams.get('id');
  
  const [comprobanteId, setComprobanteId] = useState(idParam || '');
  const [comprobante, setComprobante] = useState<any>(null);
  const [cargando, setCargando] = useState(false);

  const buscarComprobante = useCallback(async (idToSearch?: string) => {
    const targetId = idToSearch || comprobanteId;
    if (!targetId) return;
    try {
      setCargando(true);
      const data = await ventasService.obtenerComprobantePorId(Number(targetId));
      setComprobante(data);
    } catch {
      toast.error('Comprobante no encontrado');
      setComprobante(null);
    } finally {
      setCargando(false);
    }
  }, [comprobanteId]);

  useEffect(() => {
    if (idParam) {
      buscarComprobante(idParam);
    }
  }, [idParam, buscarComprobante]);

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-4 text-gray-900">

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 bg-yellow-50 rounded-lg border border-yellow-100 text-[#e6b010]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 tracking-wide">Comprobante de Venta</h1>
            <p className="text-[11px] text-gray-500 mt-0.5">Visualiza el detalle de boletas y tickets electrónicos.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <input
            type="number"
            placeholder="ID de Venta..."
            value={comprobanteId}
            onChange={(e) => setComprobanteId(e.target.value)}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:border-gray-900 outline-none w-full sm:w-40"
          />
          <button
            onClick={() => buscarComprobante()}
            className="px-4 py-1.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg text-xs transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Search className="w-3.5 h-3.5" /> Buscar
          </button>
        </div>
      </div>

      {cargando ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-14 flex justify-center items-center">
          <Loader2 className="w-5 h-5 animate-spin text-[#e6b010]" />
        </div>
      ) : comprobante ? (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4 w-full">
          <div className="flex justify-between items-start border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900">TemploGym S.A.C.</h2>
              <p className="text-[10px] text-gray-500">RUC: 20600000001</p>
              <p className="text-[10px] text-gray-500">Av. Principal 123 - Ica, Perú</p>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-0.5 bg-yellow-50 text-[#e6b010] border border-yellow-200 rounded-md font-mono font-bold text-xs">
                {comprobante.codigo}
              </span>
              <p className="text-[10px] text-gray-500 mt-1">{new Date(comprobante.createdAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="text-xs space-y-1 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
            <p><strong className="text-gray-700">Cliente:</strong> {comprobante.cliente || 'Público General'}</p>
            <p><strong className="text-gray-700">Método de Pago:</strong> {comprobante.metodoPago?.nombre || 'No especificado'}</p>
            
            {comprobante.metodoPago?.nombre === 'Efectivo' ? (
              <>
                <p><strong className="text-gray-700">Monto Entregado:</strong> S/ {Number(comprobante.montoRecibido || 0).toFixed(2)}</p>
                <p><strong className="text-gray-700">Vuelto:</strong> S/ {Number(comprobante.vuelto || 0).toFixed(2)}</p>
              </>
            ) : (
              <p><strong className="text-gray-700">N° Operación:</strong> {comprobante.numeroOperacion || 'N/A'}</p>
            )}

            <p><strong className="text-gray-700">Estado:</strong> {comprobante.estado}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="py-2.5 px-3">Producto</th>
                  <th className="py-2.5 px-3 text-center">Cant.</th>
                  <th className="py-2.5 px-3 text-right">P. Unit</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {comprobante.detalles?.map((det: any) => (
                  <tr key={det.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-2.5 px-3 text-gray-900 font-medium">{det.producto?.nombre || `Prod ID: ${det.productoId}`}</td>
                    <td className="py-2.5 px-3 text-center text-gray-600">{det.cantidad}</td>
                    <td className="py-2.5 px-3 text-right text-gray-600">S/ {Number(det.precioUnit).toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-gray-900">S/ {Number(det.subtotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-xs font-bold text-gray-900">
            <span>Total Cancelado:</span>
            <span className="text-sm font-extrabold text-[#e6b010]">S/ {Number(comprobante.total).toFixed(2)}</span>
          </div>

          <div className="pt-2 flex justify-end border-t border-gray-100">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Imprimir Comprobante
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-14 text-center rounded-xl border border-gray-200 shadow-sm text-gray-400 text-xs w-full">
          Selecciona o busca un comprobante válido para visualizar su contenido fiscal.
        </div>
      )}
    </div>
  );
}
