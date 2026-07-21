import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, LucideIcon } from 'lucide-react';

interface SubItem {
  path: string;
  label: string;
}

interface SidebarItemProps {
  path: string;
  label: string;
  icon: LucideIcon;
  subItems?: SubItem[];
  closeSidebar: () => void;
  isOpenDropdown: boolean;
  onToggle: () => void;
}

const SidebarItem = ({
  path,
  label,
  icon: Icon,
  subItems,
  closeSidebar,
  isOpenDropdown,
  onToggle,
}: SidebarItemProps) => {
  const location = useLocation();
  const hasSubItems = subItems && subItems.length > 0;
  const IconComponent = Icon;

  const isActive = location.pathname === path || (hasSubItems && subItems.some(sub => location.pathname === sub.path));

  // Si no tiene subítem (como el Dashboard), actúa como enlace directo
  if (!hasSubItems) {
    return (
      <Link
        to={path}
        onClick={closeSidebar}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
          isActive
            ? 'bg-[#e6b010] text-black font-bold shadow-md'
            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        }`}
      >
        {IconComponent && <IconComponent className={`w-5 h-5 ${isActive ? 'text-black' : 'text-gray-400'}`} />}
        <span>{label}</span>
      </Link>
    );
  }

  // Si tiene subítem, renderiza el botón desplegable con acordeón
  return (
    <div>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
          isActive || isOpenDropdown
            ? 'bg-gray-800 text-white font-semibold'
            : 'text-gray-400 hover:bg-gray-800/60 hover:text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          {IconComponent && <IconComponent className="w-5 h-5 text-[#e6b010]" />}
          <span>{label}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpenDropdown ? 'rotate-180 text-[#e6b010]' : 'text-gray-500'
          }`}
        />
      </button>

      {isOpenDropdown && (
        <div className="ml-8 mt-1 space-y-1 border-l border-gray-800 pl-3">
          {subItems.map((sub) => {
            const isSubActive = location.pathname === sub.path;
            return (
              <Link
                key={sub.path}
                to={sub.path}
                onClick={closeSidebar}
                className={`block py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                  isSubActive
                    ? 'text-[#e6b010] bg-yellow-500/10 font-bold'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
                }`}
              >
                {sub.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SidebarItem;