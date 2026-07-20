import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronRight, ChevronDown, LucideIcon } from 'lucide-react';

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
}

const SidebarItem = ({ path, label, icon: Icon, subItems, closeSidebar }: SidebarItemProps) => {
  const location = useLocation();
  const isPathActive = location.pathname.startsWith(path);
  const [isOpen, setIsOpen] = useState(isPathActive);

  const hasSubItems = subItems && subItems.length > 0;
  const toggleOpen = () => setIsOpen(!isOpen);

  const baseButtonClass = `flex w-full items-center justify-between rounded-md px-3 py-2.5 text-[15px] transition-all duration-200 ${
    isPathActive && !hasSubItems
      ? 'text-white font-bold'
      : 'text-gray-400 font-medium hover:bg-white/5 hover:text-white'
  }`;

  return (
    <div className="space-y-1">
      {hasSubItems ? (
        <button onClick={toggleOpen} className={baseButtonClass}>
          <div className="flex items-center gap-3">
            <Icon className="h-[18px] w-[18px]" strokeWidth={isPathActive ? 2.5 : 2} />
            <span className="tracking-wide">{label}</span>
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 opacity-70" />
          ) : (
            <ChevronRight className="h-4 w-4 opacity-70" />
          )}
        </button>
      ) : (
        <NavLink 
          to={path} 
          className={baseButtonClass}
          onClick={closeSidebar} 
        >
          <div className="flex items-center gap-3">
            <Icon className="h-[18px] w-[18px]" strokeWidth={isPathActive ? 2.5 : 2} />
            <span className="tracking-wide">{label}</span>
          </div>
        </NavLink>
      )}

      {hasSubItems && isOpen && (
        <div className="mt-1 flex flex-col space-y-1 pl-9 pr-2">
          {subItems.map((subItem) => (
            <NavLink
              key={subItem.path}
              to={subItem.path}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-[13px] transition-colors ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {subItem.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

export default SidebarItem;