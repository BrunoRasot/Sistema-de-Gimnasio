import { useState } from 'react';
import SidebarItem from './SidebarItem';
import { menuGroups } from '../../routes/menu';
import logoSidebar from '../../assets/logos/lg-sidebar.png';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

const Sidebar = ({ isOpen, closeSidebar }: SidebarProps) => {
  const [openItemPath, setOpenItemPath] = useState<string | null>(null);

  const handleToggle = (path: string) => {
    setOpenItemPath((prev) => (prev === path ? null : path));
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 flex h-screen w-60 flex-col 
        bg-[#1a1a1a]
        border-r border-gray-800 shadow-2xl transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="flex flex-col items-center justify-center py-6 shrink-0">
        <img
          src={logoSidebar}
          alt="Logo TemploGym"
          className="w-36 object-contain drop-shadow-md"
        />
      </div>

      <div className="mx-6 mb-4 border-b border-gray-800 shrink-0"></div>

      <nav className="flex-1 overflow-y-auto px-3 pb-6 space-y-5 custom-scrollbar">
        {menuGroups.map((group, index) => (
          <div key={index}>
            <h3 className="mb-2 px-3 text-[10px] font-bold tracking-widest text-gray-500 uppercase">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <SidebarItem
                  key={item.path}
                  {...item}
                  closeSidebar={closeSidebar}
                  isOpenDropdown={openItemPath === item.path}
                  onToggle={() => handleToggle(item.path)}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;