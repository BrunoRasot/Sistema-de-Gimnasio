import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, ChevronDown, User, Settings, LogOut, Bell, AlertTriangle, CheckCircle } from 'lucide-react';
import { notificacionesService } from '../../services/notificaciones.service';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [userData, setUserData] = useState<{ nombreUsuario: string; email: string; rol?: string } | null>(null);
  const [notificaciones, setNotificaciones] = useState<any[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }

    notificacionesService.obtenerAlertasSistema()
      .then((data: any[]) => setNotificaciones(data))
      .catch((err: unknown) => console.error("Error cargando alertas:", err));

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const noLeidas = notificaciones.filter(n => !n.leida).length;

  const marcarTodasComoLeidas = () => {
    setNotificaciones(notificaciones.map(n => ({ ...n, leida: true })));
  };

  const handleIrAPerfil = () => {
    setIsDropdownOpen(false);
    navigate('/configuracion/info');
  };

  const handleIrAPreferencias = () => {
    setIsDropdownOpen(false);
    navigate('/configuracion/seguridad');
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/', { replace: true });
  };

  return (
    <header className="flex h-14 items-center justify-between bg-[#1a1a1a] px-4 md:px-6 border-b border-gray-800 text-white relative z-10 w-full">

      <div>
        <button
          onClick={toggleSidebar}
          className="text-[#e6b010] hover:bg-white/5 p-1.5 rounded-lg transition-colors lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center gap-3">

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-transparent hover:border-gray-700 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center h-9 w-9"
          >
            <Bell className="h-4 w-4" />
            {noLeidas > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#e6b010] text-[10px] font-bold text-black shadow-sm">
                {noLeidas}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-2xl bg-[#222222] border border-gray-800 shadow-2xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-[#1c1c1c] border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Notificaciones del Sistema</span>
                  {noLeidas > 0 && (
                    <span className="px-2 py-0.5 bg-[#e6b010]/20 text-[#e6b010] text-[10px] font-semibold rounded-full border border-[#e6b010]/30">
                      {noLeidas} nuevas
                    </span>
                  )}
                </div>
                {noLeidas > 0 && (
                  <button
                    onClick={marcarTodasComoLeidas}
                    className="text-[11px] text-gray-400 hover:text-white font-medium transition-colors"
                  >
                    Marcar leídas
                  </button>
                )}
              </div>

              <div className="max-h-[300px] overflow-y-auto custom-scrollbar divide-y divide-gray-800">
                {notificaciones.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-500">
                    No hay alertas pendientes en el sistema.
                  </div>
                ) : (
                  notificaciones.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3.5 flex items-start gap-3 transition-colors hover:bg-white/[0.02] ${!notif.leida ? 'bg-[#e6b010]/[0.03]' : ''
                        }`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {notif.tipo === 'stock' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                        {notif.tipo === 'vencimiento' && <CheckCircle className="w-4 h-4 text-blue-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs leading-relaxed ${!notif.leida ? 'text-white font-medium' : 'text-gray-400'}`}>
                          {notif.texto}
                        </p>
                        <span className="text-[10px] text-gray-500 mt-1 block">{notif.hora}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 p-1 pr-2 md:pr-3 bg-white/5 hover:bg-white/10 border border-transparent hover:border-gray-700 rounded-full transition-all duration-200 cursor-pointer"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e6b010] text-black shrink-0 shadow-inner">
              <User className="h-4 w-4" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold leading-none capitalize text-gray-100">
                {userData?.nombreUsuario || 'Administrador'}
              </p>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                {userData?.email || 'cargando...'}
              </p>
            </div>
            <ChevronDown className={`h-3.5 w-3.5 text-gray-400 ml-1 hidden md:block transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </div>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2.5 w-52 rounded-xl bg-[#222222] border border-gray-800 shadow-2xl py-1.5 z-50 overflow-hidden">
              <button
                onClick={handleIrAPerfil}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <User className="h-4 w-4" />
                Mi Perfil
              </button>
              <button
                onClick={handleIrAPreferencias}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Settings className="h-4 w-4" />
                Preferencias
              </button>
              <div className="my-1.5 border-t border-gray-800"></div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;