import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, RefreshCw, Edit2, Trash2, Truck, Loader2, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { obtenerProveedores, crearProveedor, actualizarProveedor, eliminarProveedor } from '../../services/proveedores.service';

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [buscar, setBuscar] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [proveedorEditando, setProveedorEditando] = useState<any | null>(null);
  const [formData, setFormData] = useState({ nombre: '', contacto: '', telefono: '', email: '', direccion: '', estado: true });
  const [guardando, setGuardando] = useState(false);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const data = await obtenerProveedores();
      setProveedores(data);
    } catch (err) {
      toast.error('Error al cargar proveedores');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleOpenModal = (proveedor?: any) => {
    if (proveedor) {
      setProveedorEditando(proveedor);
      setFormData({ 
        nombre: proveedor.nombre, contacto: proveedor.contacto || '', telefono: proveedor.telefono || '', 
        email: proveedor.email || '', direccion: proveedor.direccion || '', estado: proveedor.estado 
      });
    } else {
      setProveedorEditando(null);
      setFormData({ nombre: '', contacto: '', telefono: '', email: '', direccion: '', estado: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      if (proveedorEditando) {
        await actualizarProveedor(proveedorEditando.id, formData);
        toast.success('Proveedor actualizado');
      } else {
        await crearProveedor(formData);
        toast.success('Proveedor creado');
      }
      setIsModalOpen(false);
      cargarDatos();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = (proveedor: any) => {
    Swal.fire({
      title: '¿Eliminar proveedor?',
      text: `¿Estás seguro de eliminar a "${proveedor.nombre}"?`,
      icon: 'warning',
      background: '#ffffff',
      color: '#1f2937',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#e5e7eb',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: '<span style="color: black">Cancelar</span>',
      customClass: { popup: 'border border-gray-200 rounded-2xl shadow-xl' }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await eliminarProveedor(proveedor.id);
          toast.success('Proveedor eliminado');
          cargarDatos();
        } catch (err: any) {
          Swal.fire({ title: 'Error', text: err.message || 'No se pudo eliminar', icon: 'error', background: '#ffffff', color: '#1f2937' });
        }
      }
    });
  };

  const proveedoresFiltrados = useMemo(() => {
    return proveedores.filter(p => 
      p.nombre.toLowerCase().includes(buscar.toLowerCase()) || 
      (p.contacto && p.contacto.toLowerCase().includes(buscar.toLowerCase()))
    );
  }, [proveedores, buscar]);

  return (
    <div className="p-6 max-w-[1600px] mx-auto text-gray-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-100">
            <Truck className="w-6 h-6 text-[#e6b010]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-wide">Proveedores</h1>
            <p className="text-sm text-gray-500 mt-1">Directorio de distribuidores y marcas.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={cargarDatos} className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-500 transition-all border border-gray-200">
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-5 py-2.5 bg-[#e6b010] hover:bg-[#d4a00e] text-white font-bold rounded-xl text-sm transition-all shadow-md">
            <Plus className="w-4 h-4" /> Nuevo Proveedor
          </button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por empresa o contacto..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-11 pr-4 text-sm focus:border-[#e6b010] outline-none shadow-sm"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200">
                <th className="p-5 pl-6">Empresa</th>
                <th className="p-5">Contacto</th>
                <th className="p-5">Teléfono / Email</th>
                <th className="p-5 text-center">Estado</th>
                <th className="p-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {cargando ? (
                <tr><td colSpan={5} className="p-12 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#e6b010]" /> Cargando...</td></tr>
              ) : proveedoresFiltrados.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-gray-500">No hay proveedores registrados.</td></tr>
              ) : (
                proveedoresFiltrados.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 pl-6">
                      <p className="font-semibold text-gray-900">{p.nombre}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{p.direccion || 'Sin dirección'}</p>
                    </td>
                    <td className="p-4 text-gray-700">{p.contacto || '---'}</td>
                    <td className="p-4">
                      <p className="text-gray-900">{p.telefono || '---'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{p.email || '---'}</p>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${p.estado ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                        {p.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleOpenModal(p)} className="p-2 text-gray-500 hover:text-[#e6b010] hover:bg-yellow-50 rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleEliminar(p)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">{proveedorEditando ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-all"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nombre de la Empresa *</label>
                  <input required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-[#e6b010] outline-none" placeholder="Ej. Optimum Nutrition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nombre del Contacto</label>
                  <input value={formData.contacto} onChange={e => setFormData({...formData, contacto: e.target.value})} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-[#e6b010] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Teléfono</label>
                  <input value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-[#e6b010] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Correo Electrónico</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-[#e6b010] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Dirección</label>
                  <input value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-[#e6b010] outline-none" />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <input type="checkbox" id="estadoProv" checked={formData.estado} onChange={e => setFormData({...formData, estado: e.target.checked})} className="w-4 h-4 text-[#e6b010] rounded border-gray-300 focus:ring-[#e6b010] cursor-pointer" />
                <label htmlFor="estadoProv" className="text-sm font-medium text-gray-700 cursor-pointer">Proveedor Activo</label>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-all">Cancelar</button>
                <button type="submit" disabled={guardando} className="flex items-center gap-2 px-6 py-2.5 bg-[#e6b010] hover:bg-[#d4a00e] text-white font-bold text-sm rounded-xl shadow-md disabled:opacity-70 transition-all">
                  {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}