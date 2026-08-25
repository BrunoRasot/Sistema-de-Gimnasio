import { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Search, Plus, Minus, Trash2, Loader2, CheckCircle, Store } from 'lucide-react';
import { obtenerProductos } from '../../services/productos.service';
import { ventasService } from '../../services/ventas.service';
import { pagosService } from '../../services/pagos.service';
import toast from 'react-hot-toast';

export default function NuevaVentaPage() {
  const [productos, setProductos] = useState<any[]>([]);
  const [metodosPago, setMetodosPago] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState<any[]>([]);
  const [cliente, setCliente] = useState('');
  const [metodoId, setMetodoId] = useState<number | null>(null);
  const [montoRecibido, setMontoRecibido] = useState<string>('');
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        const [dataProductos, dataMetodos] = await Promise.all([
          obtenerProductos(),
          pagosService.obtenerMetodos()
        ]);
        
        setProductos(dataProductos.filter((p: any) => p.estado === 'Activo' && p.stock > 0));
        
        const metodosActivos = dataMetodos.filter((m: any) => m.activo);
        setMetodosPago(metodosActivos);
        
        if (metodosActivos.length > 0) {
          setMetodoId(metodosActivos[0].id);
        } else {
          setMetodoId(null);
        }

      } catch (error) {
        toast.error('Error al cargar los datos para la venta');
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  const productosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return productos;
    const term = busqueda.toLowerCase();
    return productos.filter(p => 
      p.nombre.toLowerCase().includes(term) || 
      p.sku.toLowerCase().includes(term)
    );
  }, [productos, busqueda]);

  const agregarAlCarrito = (producto: any) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.productoId === producto.id);
      if (existe) {
        if (existe.cantidad >= producto.stock) {
          toast.error('No hay más stock disponible');
          return prev;
        }
        return prev.map(item => 
          item.productoId === producto.id 
            ? { ...item, cantidad: item.cantidad + 1 } 
            : item
        );
      }
      return [...prev, { 
        productoId: producto.id, 
        nombre: producto.nombre, 
        precioUnit: Number(producto.precioVenta), 
        cantidad: 1,
        stock: producto.stock
      }];
    });
  };

  const modificarCantidad = (id: number, delta: number) => {
    setCarrito(prev => prev.map(item => {
      if (item.productoId === id) {
        const nuevaCantidad = item.cantidad + delta;
        if (nuevaCantidad > 0 && nuevaCantidad <= item.stock) {
          return { ...item, cantidad: nuevaCantidad };
        }
      }
      return item;
    }));
  };

  const quitarDelCarrito = (id: number) => {
    setCarrito(prev => prev.filter(item => item.productoId !== id));
  };

  const total = carrito.reduce((acc, item) => acc + (item.precioUnit * item.cantidad), 0);
  const vuelto = montoRecibido ? (Number(montoRecibido) - total) : 0;

  const handleProcesarVenta = async () => {
    if (carrito.length === 0) {
      toast.error('Agregue productos al carrito');
      return;
    }
    if (montoRecibido && Number(montoRecibido) < total) {
      toast.error('El monto recibido es menor al total');
      return;
    }
    if (!metodoId) {
      toast.error('Seleccione un método de pago activo');
      return;
    }

    try {
      setProcesando(true);
      const items = carrito.map(item => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnit: item.precioUnit
      }));

      await ventasService.crearVenta({
        cliente: cliente.trim() || 'Público General',
        metodoId,
        montoRecibido: montoRecibido ? Number(montoRecibido) : undefined,
        vuelto: vuelto > 0 ? vuelto : 0,
        items
      });

      toast.success('Venta completada exitosamente');
      
      setCarrito([]);
      setCliente('');
      setMontoRecibido('');
      
      const dataProductos = await obtenerProductos();
      setProductos(dataProductos.filter((p: any) => p.estado === 'Activo' && p.stock > 0));

    } catch (error: any) {
      toast.error(error.message || 'Error al procesar la venta');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-4 text-gray-900">
      
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
        <div className="p-2.5 bg-yellow-50 rounded-lg border border-yellow-100 text-[#e6b010]">
          <ShoppingCart className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-900 tracking-wide">Nueva Venta</h1>
          <p className="text-[11px] text-gray-500 mt-0.5">Selecciona productos del catálogo y procesa la transacción.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        <div className="lg:col-span-2 space-y-4 flex flex-col">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o SKU..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-xs text-gray-900 focus:border-gray-900 outline-none transition-all shadow-sm"
            />
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex-1 min-h-[400px]">
            {cargando ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-[#e6b010]" />
              </div>
            ) : productosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                <Store className="w-8 h-8 opacity-50" />
                <p className="text-xs">No hay productos disponibles.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                {productosFiltrados.map((p) => (
                  <div 
                    key={p.id} 
                    onClick={() => agregarAlCarrito(p)}
                    className="p-3 border border-gray-200 rounded-xl cursor-pointer hover:border-[#e6b010] hover:bg-yellow-50/30 transition-all group flex flex-col justify-between h-full"
                  >
                    <div>
                      <p className="text-[10px] text-gray-500 mb-1">{p.sku}</p>
                      <h3 className="text-xs font-bold text-gray-900 leading-tight mb-2 line-clamp-2 group-hover:text-[#e6b010] transition-colors">{p.nombre}</h3>
                    </div>
                    <div className="flex items-end justify-between mt-2 pt-2 border-t border-gray-100">
                      <div>
                        <p className="text-[10px] text-gray-500">Precio</p>
                        <p className="text-sm font-extrabold text-gray-900">S/ {Number(p.precioVenta).toFixed(2)}</p>
                      </div>
                      <span className="text-[10px] font-medium bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">Stock: {p.stock}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col h-full min-h-[500px]">
          <h2 className="text-xs font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4 tracking-wider uppercase">
            <ShoppingCart className="w-4 h-4 text-[#e6b010]" /> Resumen de Venta
          </h2>

          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Cliente</label>
              <input 
                type="text" 
                placeholder="Público General" 
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-gray-900 placeholder-gray-400" 
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Método de Pago</label>
              <select 
                value={metodoId ?? ''}
                onChange={(e) => setMetodoId(Number(e.target.value) || null)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-gray-900"
              >
                {metodosPago.length === 0 ? (
                  <option value="">No hay métodos activos</option>
                ) : (
                  metodosPago.map((m) => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Recibido (S/)</label>
                <input 
                  type="number" 
                  min="0" step="0.01"
                  placeholder="0.00" 
                  value={montoRecibido}
                  onChange={(e) => setMontoRecibido(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-gray-900" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Vuelto</label>
                <div className={`w-full px-3 py-2 border rounded-lg text-xs font-bold flex items-center ${vuelto >= 0 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                  S/ {vuelto.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar border border-gray-100 rounded-lg bg-gray-50/50 p-2 mb-4">
            {carrito.length === 0 ? (
              <div className="flex items-center justify-center h-full text-[11px] text-gray-400">
                No hay productos agregados
              </div>
            ) : (
              <div className="space-y-2">
                {carrito.map(item => (
                  <div key={item.productoId} className="flex flex-col bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs font-bold text-gray-900 leading-tight pr-2">{item.nombre}</p>
                      <button onClick={() => quitarDelCarrito(item.productoId)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 bg-gray-100 rounded-md border border-gray-200 p-0.5">
                        <button onClick={() => modificarCantidad(item.productoId, -1)} className="p-1 hover:bg-white rounded text-gray-600 transition-colors"><Minus className="w-3 h-3" /></button>
                        <span className="text-xs font-bold w-4 text-center">{item.cantidad}</span>
                        <button onClick={() => modificarCantidad(item.productoId, 1)} className="p-1 hover:bg-white rounded text-gray-600 transition-colors"><Plus className="w-3 h-3" /></button>
                      </div>
                      <p className="text-xs font-bold text-[#e6b010]">
                        S/ {(item.precioUnit * item.cantidad).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-gray-200">
            <div className="flex justify-between items-end mb-4">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total a Pagar:</span>
              <span className="text-xl font-extrabold text-gray-900">S/ {total.toFixed(2)}</span>
            </div>
            
            <button 
              onClick={handleProcesarVenta}
              disabled={procesando || carrito.length === 0}
              className="w-full py-3 bg-[#141414] hover:bg-black text-white font-medium rounded-xl text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {procesando ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Completar Venta
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
