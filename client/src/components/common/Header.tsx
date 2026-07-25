import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, ChevronDown, User, Settings, LogOut } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userData, setUserData] = useState<{ nombreUsuario: string; email: string; rol?: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

      <div className="flex items-center gap-3 md:gap-4">

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
              <div className="px-4 py-2.5 border-b border-gray-800 md:hidden mb-1">
                <p className="text-sm font-bold text-white capitalize">{userData?.nombreUsuario || 'Administrador'}</p>
                <p className="text-xs text-gray-400">{userData?.email || 'cargando...'}</p>
              </div>

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