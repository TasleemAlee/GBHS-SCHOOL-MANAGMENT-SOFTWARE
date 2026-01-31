
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import { type ModuleId } from '../../types';

const CommandPalette: React.FC<{ isOpen: boolean; onClose: () => void; setActiveModule: (id: ModuleId) => void }> = ({ isOpen, onClose, setActiveModule }) => {
    const [query, setQuery] = useState('');
    const { modules } = useApp();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    const items = [
        ...modules.filter(m => m.enabled).map(m => ({ id: m.id, name: `Go to ${m.name}`, icon: m.icon, type: 'nav' })),
        { id: 'student-add', name: 'Register New Student', icon: 'person_add', type: 'action' },
        { id: 'fee-collect', name: 'Collect Fees', icon: 'payments', type: 'action' },
        { id: 'theme-toggle', name: 'Toggle Dark Mode', icon: 'dark_mode', type: 'action' }
    ].filter(i => i.name.toLowerCase().includes(query.toLowerCase()));

    const handleAction = (item: any) => {
        if (item.type === 'nav') {
            setActiveModule(item.id);
        } else {
            // Logic for specific actions could be triggered via events or direct context calls
            console.log("Action triggered:", item.id);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-[100] flex justify-center pt-[15vh] px-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border dark:border-gray-700 h-fit animate-fade-in" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b dark:border-gray-700 flex items-center">
                    <span className="material-icons-sharp text-gray-400 mr-3">search</span>
                    <input 
                        ref={inputRef}
                        type="text" 
                        placeholder="Search zenith commands... (Esc to close)" 
                        className="bg-transparent border-none outline-none w-full text-lg dark:text-white"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Escape' && onClose()}
                    />
                </div>
                <div className="max-h-[350px] overflow-y-auto py-2">
                    {items.length > 0 ? items.map(item => (
                        <button 
                            key={item.id}
                            onClick={() => handleAction(item)}
                            className="w-full text-left px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center group transition-colors"
                        >
                            <span className="material-icons-sharp mr-4 text-gray-400 group-hover:text-indigo-500">{item.icon}</span>
                            <span className="font-medium">{item.name}</span>
                        </button>
                    )) : <p className="p-10 text-center text-gray-500">No commands found.</p>}
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700 flex justify-end">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Zenith Command Center</p>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
