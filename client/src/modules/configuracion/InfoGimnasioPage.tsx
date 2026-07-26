import { useState, useEffect, useRef } from 'react';
import { configuracionService } from '../../services/configuracion.service';
import { Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InfoGimnasioPage() {
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    ruc: '',
    email: '',
    telefono: '',
    direccion: '',
    zonaHoraria: 'América/Lima (GMT-5)',
    moneda: 'Sol peruano (PEN)',
    logo: ''
  });

  const cargarDatos = async () => {
    try {
      const data = await configuracionService.obtenerDatos();
      if (data) {
        setFormData({
          nombre: data.nombre || '',
          ruc: data.ruc || '',
          email: data.email || '',
          telefono: data.telefono || '',
          direccion: data.direccion || '',
          zonaHoraria: data.zonaHoraria || 'América/Lima (GMT-5)',
          moneda: data.moneda || 'Sol peruano (PEN)',
          logo: data.logo || ''
        });
      }
    } catch (error) {
      toast.error('Error al cargar la configuración');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        return toast.error('La imagen es muy grande. Máximo 2MB.');
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    setGuardando(true);
    try {
      await configuracionService.actualizarInfo(formData);
      toast.success('Cambios guardados correctamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar los cambios');
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelar = () => {
    cargarDatos();
    toast('Cambios descartados', { icon: 'ℹ️' });
  };

  if (cargando) {
    return <div className="p-8 text-center text-gray-500">Cargando configuración...</div>;
  }

  const iniciales = formData.nombre ? formData.nombre.substring(0, 2).toUpperCase() : 'FG';

  return (
    <div className="p-4 md:p-6 max-w-[800px] mx-auto">
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Información del gimnasio</h1>
        <p className="text-sm text-gray-500 mt-1">Estos datos aparecen en recibos, la app de socios y comunicaciones oficiales.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
          <div className="flex items-center gap-4">
            {formData.logo ? (
              <img 
                src={formData.logo} 
                alt="Logo del gimnasio" 
                className="w-14 h-14 rounded-xl object-cover shadow-sm border border-gray-200"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                {iniciales}
              </div>
            )}
            
            <div>
              <p className="text-sm font-bold text-gray-900">Logo del gimnasio</p>
              <p className="text-xs text-gray-500">PNG o SVG, máximo 2MB.</p>
            </div>
          </div>

          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleLogoUpload}
            accept="image/png, image/jpeg, image/svg+xml"
            className="hidden"
          />
          <button 
            onClick={triggerFileInput}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2"
          >
            <ImageIcon className="w-4 h-4" /> Cambiar
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Nombre del gimnasio</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">RUC / NIF</label>
              <input
                type="text"
                name="ruc"
                value={formData.ruc}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Correo de contacto</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Teléfono</label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Dirección</label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Zona horaria</label>
              <select
                name="zonaHoraria"
                value={formData.zonaHoraria}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="América/Lima (GMT-5)">América/Lima (GMT-5)</option>
                <option value="América/Bogota (GMT-5)">América/Bogota (GMT-5)</option>
                <option value="América/Santiago (GMT-5)">América/Santiago (GMT-5)</option>
                <option value="América/Mexico_City (GMT-6)">América/Mexico_City (GMT-6)</option>
                <option value="América/Buenos_Aires (GMT-3)">América/Buenos_Aires (GMT-3)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Moneda</label>
              <select
                name="moneda"
                value={formData.moneda}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="Sol peruano (PEN)">Sol peruano (PEN)</option>
                <option value="Dólar estadounidense (USD)">Dólar estadounidense (USD)</option>
                <option value="Peso mexicano (MXN)">Peso mexicano (MXN)</option>
                <option value="Peso colombiano (COP)">Peso colombiano (COP)</option>
                <option value="Peso chileno (CLP)">Peso chileno (CLP)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <button
            onClick={handleCancelar}
            className="px-5 py-2 text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 font-semibold text-xs rounded-lg transition-colors shadow-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={guardando}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>

      </div>
    </div>
  );
}