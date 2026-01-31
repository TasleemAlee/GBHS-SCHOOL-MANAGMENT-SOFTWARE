
import React, { useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { type ModuleId } from '../types';

interface SidebarProps {
    activeModule: ModuleId;
    setActiveModule: (id: ModuleId) => void;
    onMobileNavigate?: () => void;
    isMobile?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule, onMobileNavigate, isMobile = false }) => {
    const { schoolSettings, modules, currentRole, sidebarCollapsed, setSidebarCollapsed } = useApp();

    const visibleModules = useMemo(() => {
        return modules.filter(m => m.enabled && m.roleAccess.includes(currentRole));
    }, [modules, currentRole]);

    const primaryColor = schoolSettings.primaryColor;
    const isEffectivelyCollapsed = isMobile ? false : sidebarCollapsed;

    return (
        <div className={`flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-xl z-50 transition-all duration-300 ${isEffectivelyCollapsed ? 'w-20' : 'w-64'}`}>
            <div className="flex items-center justify-between h-20 px-4" style={{ backgroundColor: primaryColor }}>
                {!isEffectivelyCollapsed && (
                    <div className="flex items-center truncate">
                        {schoolSettings.logoUrl && <img src={schoolSettings.logoUrl} alt="Logo" className="h-8 w-8 mr-3 rounded-full object-contain bg-white" />}
                        <h1 className="text-lg font-black text-white truncate uppercase tracking-tight">{schoolSettings.schoolName}</h1>
                    </div>
                )}
                {isEffectivelyCollapsed && <img src={schoolSettings.logoUrl || 'https://via.placeholder.com/40'} alt="Logo" className="h-10 w-10 rounded-full mx-auto" />}
            </div>
            
            <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                {visibleModules.map(module => (
                    <button
                        key={module.id}
                        onClick={() => {
                            setActiveModule(module.id);
                            onMobileNavigate?.();
                        }}
                        className={`flex items-center w-full px-3 py-2.5 text-sm font-bold rounded-xl transition-all group relative ${
                            activeModule === module.id
                                ? 'text-white shadow-lg'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                        }`}
                        style={activeModule === module.id ? { backgroundColor: primaryColor } : {}}
                    >
                        <span className={`material-icons-sharp ${isEffectivelyCollapsed ? 'mx-auto' : 'mr-3'} transition-transform group-hover:scale-110`}>{module.icon}</span>
                        {!isEffectivelyCollapsed && <span>{module.name}</span>}
                        {isEffectivelyCollapsed && activeModule === module.id && (
                            <div className="absolute left-0 w-1 h-6 rounded-r-full bg-white"></div>
                        )}
                    </button>
                ))}
            </nav>
            
            {!isMobile && (
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-center">
                    <button 
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-2 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-indigo-500 transition-colors"
                        aria-label="Collapse Sidebar"
                    >
                        <span className="material-icons-sharp">{sidebarCollapsed ? 'last_page' : 'first_page'}</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default Sidebar;
