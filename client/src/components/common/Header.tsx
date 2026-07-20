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
    <header className="flex h-[72px] items-center justify-between bg-[#1a1a1a] px-4 md:px-6 border-b border-gray-800 text-white relative z-10 w-full">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="text-[#e6b010] hover:text-yellow-400 transition-colors lg:hidden p-1"
        >
          <Menu className="h-7 w-7" />
        </button>
        <h1 className="text-base md:text-lg font-medium tracking-wide hidden sm:block">
          Panel Administrativo
        </h1>
      </div>

      <div className="relative" ref={dropdownRef}>
        <div 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors"
        >
          <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-[#e6b010] text-black shrink-0">
            <User className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold leading-none capitalize">
              {userData?.nombreUsuario || 'Administrador'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {userData?.email || 'cargando...'}
            </p>
          </div>
          <ChevronDown className={`h-4 w-4 text-gray-400 ml-1 hidden md:block transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </div>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-md bg-[#222] border border-gray-800 shadow-xl py-1 z-50">
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
            <div className="my-1 border-t border-gray-800"></div>
            <button 
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;