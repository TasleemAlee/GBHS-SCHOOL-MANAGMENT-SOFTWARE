
import React, { useState, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import Button from '../common/Button';
import Toggle from '../common/Toggle';
import DataImport from './DataImport';

const AdminSettings: React.FC = () => {
    const { 
        schoolSettings, setSchoolSettings, modules, setModules, 
        workspaces, currentWorkspaceId, createNewWorkspace, exportWorkspace, importWorkspace, switchWorkspace 
    } = useApp();
    
    const [activeTab, setActiveTab] = useState<'branding' | 'import' | 'workspaces' | 'modules'>('branding');
    const [localSettings, setLocalSettings] = useState(schoolSettings);
    const [notification, setNotification] = useState('');
    const [newWsName, setNewWsName] = useState('');
    const logoInputRef = useRef<HTMLInputElement>(null);

    const showNotification = (message: string) => {
        setNotification(message);
        setTimeout(() => setNotification(''), 3000);
    };

    const handleSettingsSave = () => {
        setSchoolSettings(localSettings);
        showNotification('School identity settings updated successfully!');
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setLocalSettings(prev => ({ ...prev, logoUrl: event.target.result as string }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleModuleToggle = (moduleId: string) => {
        setModules(prevModules =>
            prevModules.map(m =>
                m.id === moduleId ? { ...m, enabled: !m.enabled } : m
            )
        );
    };

    const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const json = event.target?.result as string;
            importWorkspace(json);
        };
        reader.readAsText(file);
    };
    
    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Management Console</h1>
                <div className="flex bg-white dark:bg-gray-800 p-1 rounded-2xl shadow-sm border dark:border-gray-700 overflow-x-auto max-w-full">
                    {[
                        { id: 'branding', icon: 'palette', label: 'Identity' },
                        { id: 'import', icon: 'upload_file', label: 'Bulk Import' },
                        { id: 'workspaces', icon: 'workspaces', label: 'Backups' },
                        { id: 'modules', icon: 'view_module', label: 'Modules' }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500'}`}
                        >
                            <span className="material-icons-sharp text-sm">{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>
            
            {notification && (
                <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 p-4 rounded-2xl flex items-center animate-fade-in" role="alert">
                    <span className="material-icons-sharp mr-2">check_circle</span>
                    <p className="font-bold">{notification}</p>
                </div>
            )}

            {activeTab === 'branding' && (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 animate-fade-in">
                    <h2 className="text-xl font-black mb-6 uppercase tracking-tight flex items-center">
                        <span className="material-icons-sharp mr-2 text-indigo-500">palette</span>
                        Official School Identity
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                        <div className="md:col-span-4 flex flex-col items-center justify-center space-y-4 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-dashed dark:border-gray-700">
                            <div className="relative group">
                                <div className="h-40 w-40 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl bg-white flex items-center justify-center p-2 relative">
                                    {localSettings.logoUrl ? (
                                        <img src={localSettings.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                                    ) : (
                                        <span className="material-icons-sharp text-6xl text-gray-200">school</span>
                                    )}
                                    <button 
                                        onClick={() => logoInputRef.current?.click()}
                                        className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                                    >
                                        <span className="material-icons-sharp text-3xl mb-1">photo_camera</span>
                                        <span className="text-[10px] font-black uppercase">Change Seal</span>
                                    </button>
                                </div>
                            </div>
                            <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                            <div className="text-center">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recommended: Square PNG/JPG</p>
                            </div>
                        </div>

                        <div className="md:col-span-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">School Name (Official)</label>
                                    <input type="text" value={localSettings.schoolName} onChange={e => setLocalSettings({...localSettings, schoolName: e.target.value})} className="w-full p-3 border rounded-2xl dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 ring-indigo-500 font-bold transition-all dark:text-white" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Theme Accent Color</label>
                                    <div className="flex space-x-2">
                                        <input type="color" value={localSettings.primaryColor} onChange={e => setLocalSettings({...localSettings, primaryColor: e.target.value})} className="h-12 w-16 p-1 border rounded-2xl dark:bg-gray-700 cursor-pointer" />
                                        <input type="text" value={localSettings.primaryColor} onChange={e => setLocalSettings({...localSettings, primaryColor: e.target.value})} className="flex-1 p-3 border rounded-2xl dark:bg-gray-700 dark:border-gray-600 outline-none font-mono text-xs dark:text-white" />
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Address & Contact Header (For Reports)</label>
                                    <textarea value={localSettings.contactDetails} onChange={e => setLocalSettings({...localSettings, contactDetails: e.target.value})} rows={3} className="w-full p-3 border rounded-2xl dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 ring-indigo-500 transition-all dark:text-white" />
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button onClick={handleSettingsSave} icon="verified" className="px-10 py-3 shadow-lg">Save Official Details</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'import' && (
                <div className="animate-fade-in">
                    <DataImport />
                </div>
            )}

            {activeTab === 'workspaces' && (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 animate-fade-in">
                    <h2 className="text-xl font-black mb-6 uppercase tracking-tight flex items-center">
                        <span className="material-icons-sharp mr-2 text-indigo-500">workspaces</span>
                        Database Management
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Saved Instances</h3>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {workspaces.map(ws => (
                                    <div key={ws.id} className={`p-4 rounded-2xl border flex items-center justify-between group transition-all ${ws.id === currentWorkspaceId ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-100 dark:border-gray-700'}`}>
                                        <div>
                                            <p className="font-bold">{ws.name}</p>
                                            <p className="text-[10px] text-gray-400 uppercase font-black">Last Sync: {new Date(ws.lastActive).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex space-x-2">
                                            {ws.id !== currentWorkspaceId && (
                                                <button onClick={() => switchWorkspace(ws.id)} className="text-xs font-black text-indigo-500 uppercase">Load</button>
                                            )}
                                            <button onClick={() => exportWorkspace(ws.id)} className="p-2 text-gray-400 hover:text-indigo-500"><span className="material-icons-sharp text-sm">download</span></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl space-y-4 border border-gray-100 dark:border-gray-800">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">New Backup Point</h3>
                            <div className="flex space-x-2">
                                <input value={newWsName} onChange={e => setNewWsName(e.target.value)} placeholder="Backup Name (e.g. Session 2024)" className="flex-1 p-3 rounded-2xl border dark:bg-gray-700 text-sm font-bold shadow-sm" />
                                <Button onClick={() => { createNewWorkspace(newWsName); setNewWsName(''); }} icon="add">Create</Button>
                            </div>
                            <div className="pt-2">
                                <label className="block w-full text-center border-2 border-dashed border-gray-200 dark:border-gray-700 p-8 rounded-3xl hover:border-indigo-500 transition-colors cursor-pointer group">
                                    <span className="material-icons-sharp text-gray-300 group-hover:text-indigo-500 block mb-2">cloud_upload</span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Restore From File (.json)</span>
                                    <input type="file" className="hidden" accept=".json" onChange={handleImportFile} />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'modules' && (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 animate-fade-in">
                    <h2 className="text-xl font-black mb-8 uppercase tracking-tight flex items-center">
                        <span className="material-icons-sharp mr-2 text-indigo-500">settings_input_component</span>
                        Module Visibility Control
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {modules.filter(m => m.id !== 'dashboard' && m.id !== 'admin-settings').map(module => (
                            <div key={module.id} className="flex items-center justify-between p-4 border rounded-2xl dark:border-gray-700 hover:border-indigo-500 transition-colors bg-white dark:bg-gray-800">
                                <div className="flex items-center">
                                    <span className="material-icons-sharp text-gray-400 mr-3">{module.icon}</span>
                                    <h3 className="font-black text-xs uppercase tracking-widest">{module.name}</h3>
                                </div>
                                <Toggle enabled={module.enabled} onChange={() => handleModuleToggle(module.id)} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSettings;
