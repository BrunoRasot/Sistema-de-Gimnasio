import { useState, useEffect } from 'react';
import { RotateCcw, Loader2, Search, User, ShoppingBag, AlertCircle } from 'lucide-react';
import { ventasService } from '../../services/ventas.service';
import toast from 'react-hot-toast';

export default function DevolucionesPage() {
  const [devoluciones, setDevoluciones] = useState<any[]>([]);
  const [identificador, setIdentificador] = useState('');
  const [motivo, setMotivo] = useState('');
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  
  const [ventaEncontrada, setVentaEncontrada] = useState<any>(null);
  const [buscandoVenta, setBuscandoVenta] = useState(false);
  const [cantidades, setCantidades] = useState<Record<number, number>>({});

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const data = await ventasService.obtenerDevoluciones();
      setDevoluciones(data);
    } catch (error: any) {
      toast.error(error.message || 'Error al obtener devoluciones');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const buscarVentaPorIdentificador = async (codigoBuscado: string) => {
    if (!codigoBuscado.trim()) {
      setVentaEncontrada(null);
      return;
    }
    try {
      setBuscandoVenta(true);
      const ventas = await ventasService.obtenerVentas();
      const encontrada = ventas.find((v: any) => 
        v.codigo?.toLowerCase() === codigoBuscado.toLowerCase().trim() ||
        v.numeroOperacion?.toLowerCase() === codigoBuscado.toLowerCase().trim()
      );
      setVentaEncontrada(encontrada || null);
      setCantidades(encontrada ? Object.fromEntries(encontrada.detalles.map((d: any) => [d.productoId, d.cantidad])) : {});
    } catch (error) {
      setVentaEncontrada(null);
    } finally {
      setBuscandoVenta(false);
    }
  };

  const handleDevolucion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identificador.trim()) {
      toast.error('Ingrese un número de operación o código válido');
      return;
    }
    try {
      setProcesando(true);
      await ventasService.registrarDevolucion({
        identificador: identificador.trim(),
        motivo: motivo.trim() || 'Devolución de productos',
        items: Object.entries(cantidades).filter(([, cantidad]) => cantidad > 0).map(([productoId, cantidad]) => ({ productoId: Number(productoId), cantidad }))
      });
      toast.success('Devolución procesada y stock restaurado');
      setIdentificador('');
      setMotivo('');
      setVentaEncontrada(null);
      cargarDatos();
    } catch (error: any) {
      toast.error(error.message || 'Error al procesar devolución');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-4 text-gray-900">
      
      <div className="module-header bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 bg-yellow-50 rounded-lg border border-yellow-100 text-[#e6b010]">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 tracking-wide">Gestión de Devoluciones</h1>
            <p className="text-[11px] text-gray-500 mt-0.5">Anula ventas buscando por Número de Operación o Código de Venta.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm h-fit space-y-4">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <RotateCcw className="w-4 h-4 text-[#e6b010]" /> Registrar Devolución
          </h2>
          
          <form onSubmit={handleDevolucion} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                N° Operación o Código *
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Ej. VNT-0001"
                  value={identificador}
                  onChange={(e) => {
                    setIdentificador(e.target.value);
                    buscarVentaPorIdentificador(e.target.value);
                  }}
                  required
                  className="w-full pl-3 pr-9 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:border-gray-900 outline-none placeholder-gray-400"
                />
                <Search className="absolute right-3 w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>

            {buscandoVenta ? (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-center text-xs text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1 text-[#e6b010]" /> Buscando venta...
              </div>
            ) : ventaEncontrada ? (
              <div className="p-3.5 bg-yellow-50/40 border border-yellow-200/60 rounded-xl space-y-2 text-xs animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-yellow-200/50 pb-2">
                  <span className="font-bold text-gray-900 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-[#e6b010]" /> {ventaEncontrada.codigo}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-white border border-yellow-200 rounded text-yellow-800">
                    {ventaEncontrada.metodoPago?.nombre || 'Sin método'}
                  </span>
                </div>

                <div className="space-y-1 text-gray-700">
                  <p className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <strong className="text-gray-900">Cliente:</strong> {ventaEncontrada.cliente || 'Público General'}
                  </p>
                  <p>
                    <strong className="text-gray-900">Total Venta:</strong> S/ {Number(ventaEncontrada.total || 0).toFixed(2)}
                  </p>
                  <p>
                    <strong className="text-gray-900">Fecha:</strong> {new Date(ventaEncontrada.createdAt).toLocaleString()}
                  </p>
                </div>

                {ventaEncontrada.detalles && ventaEncontrada.detalles.length > 0 && (
                  <div className="pt-1 border-t border-yellow-200/50">
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Productos en la venta:</p>
                    <ul className="space-y-0.5 text-[11px] text-gray-600">
                      {ventaEncontrada.detalles.map((det: any, idx: number) => (
                        <li key={idx} className="flex justify-between items-center gap-2">
                          <span>• {det.producto?.nombre || 'Producto'} (x{det.cantidad})</span>
                          <input aria-label={`Cantidad a devolver de ${det.producto?.nombre || 'Producto'}`} type="number" min="0" max={det.cantidad} value={cantidades[det.productoId] ?? 0} onChange={(e) => setCantidades((prev) => ({ ...prev, [det.productoId]: Math.min(det.cantidad, Math.max(0, Number(e.target.value))) }))} className="w-16 rounded border border-yellow-200 bg-white px-2 py-1 text-center" />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : identificador.trim().length > 2 ? (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-[11px]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>No se encontró ninguna venta con ese código u operación.</span>
              </div>
            ) : null}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                Motivo de Devolución *
              </label>
              <textarea
                placeholder="Detalle el motivo..."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={3}
                required
                className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:border-gray-900 outline-none resize-none placeholder-gray-400"
              />
            </div>

            <button
              type="submit"
              disabled={procesando || !ventaEncontrada}
              className="w-full py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 shadow-sm"
            >
              {procesando && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Procesar Devolución
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-sm font-bold text-gray-900">Historial de Devoluciones Registradas</h2>
          </div>
          <div className="overflow-x-auto custom-scrollbar flex-1">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4 pl-5">Identificador</th>
                  <th className="py-3 px-4">Método</th>
                  <th className="py-3 px-4">Motivo</th>
                  <th className="py-3 px-4 pr-5 text-right">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {cargando ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-gray-500">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#e6b010]" /> Cargando devoluciones...
                    </td>
                  </tr>
                ) : devoluciones.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-500">
                      No hay devoluciones registradas.
                    </td>
                  </tr>
                ) : (
                  devoluciones.map((dev) => (
                    <tr key={dev.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 pl-5 font-bold text-gray-900">
                        {dev.venta?.numeroOperacion ? dev.venta.numeroOperacion : dev.venta?.codigo}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        <span className="bg-gray-100 px-2 py-0.5 rounded-md text-[10px] font-medium border border-gray-200">{dev.venta?.metodoPago?.nombre || 'Sin método'}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{dev.motivo}</td>
                      <td className="py-3 px-4 pr-5 text-right text-gray-500">{new Date(dev.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
