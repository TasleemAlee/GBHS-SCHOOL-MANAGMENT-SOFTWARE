
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Role } from '../types';

const Header: React.FC = () => {
    const { currentRole, setCurrentRole, isOffline, schoolSettings, theme, setTheme, alerts, setAlerts, setIsMobileSidebarOpen, exportWorkspace, currentWorkspaceId } = useApp();
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);

    const unreadCount = useMemo(() => alerts.filter(a => !a.read).length, [alerts]);

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
        if (!showNotifications) {
            // Mark all as read when opening
            setAlerts(alerts.map(a => ({ ...a, read: true })));
        }
    };

    const getAlertIcon = (type: 'info' | 'warning' | 'danger') => {
        switch(type) {
            case 'info': return { icon: 'info', color: 'text-blue-500' };
            case 'warning': return { icon: 'warning', color: 'text-yellow-500' };
            case 'danger': return { icon: 'error', color: 'text-red-500' };
        }
    }

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
                 <button onClick={() => setIsMobileSidebarOpen(true)} className="md:hidden mr-4 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <span className="material-icons-sharp">menu</span>
                </button>
                 {isOffline && (
                    <div className="flex items-center mr-4 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        <span className="material-icons-sharp text-base mr-1">wifi_off</span>
                        Offline Mode
                    </div>
                )}
            </div>
            <div className="flex items-center space-x-4">
                 <button 
                    onClick={() => exportWorkspace(currentWorkspaceId)}
                    title="Save Backup to Local Drive"
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{'--tw-ring-color': schoolSettings.primaryColor, '--tw-ring-offset-color': theme === 'dark' ? '#1f2937' : '#ffffff'} as React.CSSProperties}
                >
                    <span className="material-icons-sharp">save</span>
                </button>

                <div className="relative" ref={notificationRef}>
                     <button 
                        onClick={toggleNotifications} 
                        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                    >
                        <span className="material-icons-sharp">notifications</span>
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs items-center justify-center">{unreadCount}</span>
                            </span>
                        )}
                    </button>
                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 z-50">
                            <div className="p-3 border-b dark:border-gray-700">
                                <h3 className="font-semibold dark:text-white">Notifications</h3>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {alerts.length > 0 ? alerts.map(alert => (
                                    <div key={alert.id} className="p-3 flex items-start hover:bg-gray-50 dark:hover:bg-gray-700 border-b dark:border-gray-700/50">
                                        <span className={`material-icons-sharp mr-3 ${getAlertIcon(alert.type).color}`}>{getAlertIcon(alert.type).icon}</span>
                                        <div>
                                            <p className="text-sm">{alert.message}</p>
                                            <p className="text-xs text-gray-400 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                                        </div>
                                    </div>
                                )) : <p className="p-4 text-sm text-gray-500">No new notifications.</p>}
                            </div>
                        </div>
                    )}
                </div>

                 <button 
                    onClick={toggleTheme} 
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{'--tw-ring-color': schoolSettings.primaryColor, '--tw-ring-offset-color': theme === 'dark' ? '#1f2937' : '#ffffff'} as React.CSSProperties}
                    aria-label="Toggle dark mode"
                >
                    <span className="material-icons-sharp">{theme === 'light' ? 'dark_mode' : 'light_mode'}</span>
                </button>
                <div className="relative">
                    <span className="material-icons-sharp absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">people</span>
                     <select
                        value={currentRole}
                        onChange={(e) => setCurrentRole(e.target.value as Role)}
                        className="pl-9 pr-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2"
                        style={{'--tw-ring-color': schoolSettings.primaryColor} as React.CSSProperties}
                    >
                        {Object.values(Role).map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center">
                    <span className="font-semibold dark:text-white">{currentRole} View</span>
                    <img className="w-8 h-8 rounded-full ml-3 object-cover" src={`https://i.pravatar.cc/40?u=${currentRole}`} alt="avatar" />
                </div>
            </div>
        </header>
    );
};

export default Header;
